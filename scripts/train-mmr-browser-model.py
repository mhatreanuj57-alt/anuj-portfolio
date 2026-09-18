"""Train an MMR property-price model and export browser-safe model weights.

Usage:
  python scripts/train-mmr-browser-model.py <source-kaggle-zip> <output-json>
"""
import json
import re
import sys
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


CORPORATIONS = {
    "Uran Taluka (Raigad)": (
        "uran", "antrabamdakhar", "aware", "bandhpada", "belondakhar", "bhendkhal", "bhom", "bokadvira",
        "bori bk", "boricha kotha", "boripakhadi", "chanje", "chikhali bhom", "chirle", "chirner", "dhasakhosi",
        "dhutum", "dighode", "dongari", "funde", "gharapuri", "govthane", "hanuman koliwada", "harishchandra pimpale",
        "jasai", "jaskhar", "jui", "juipunade", "juna sheva", "kacherpada", "kadape", "kaladhonda", "kalambusare",
        "kanthavali", "karal", "kauli bandhankhar", "kauli belodakhar", "kegaon", "koproli", "mhatwali", "muthekhar",
        "nagaon", "navghar", "navin sheva", "pagote", "pale", "panje", "paundkhar", "pirkone", "pohi", "punade",
        "ransai", "ranwad", "sangpalekhar", "sarde", "sawarkhar", "shematikhar", "sonari", "taki", "talbandkhar",
        "vasheni", "veshvi", "vindhane", "waltikhar",
    ),
    "Raigad District": (
        "alibag", "pen", "karjat", "khalapur", "khopoli", "matheran", "mahad", "mangaon", "mhasla", "murud",
        "nagothane", "pali", "poladpur", "roha", "shrivardhan", "tala", "rasayani",
    ),
    "NMMC": ("vashi", "nerul", "belapur", "koparkhairane", "kopar khairane", "ghansoli", "airoli", "sanpada"),
    "TMC": ("thane", "panchpakhadi", "ghodbunder", "kalwa", "mumbra", "diva"),
    "KDMC": ("kalyan", "dombivli", "dombivali", "thakurli", "titwala"),
    "MBMC": ("mira", "bhayandar"),
    "VVMC": ("naigaon", "vasai", "nala sopara", "nalasopara", "virar"),
    "PMCP": ("panvel", "kamothe", "khandeshwar", "kharghar", "kalamboli"),
    "UMC": ("ulhasnagar", "vitthalwadi"),
    "Rural / Council": ("shahapur", "vasind", "asangaon", "karjat", "khopoli", "badlapur", "ambernath"),
}

# These are the visitor-facing geography choices. They deliberately include
# the MMR municipal framework supplied for the project, even where a public
# listing source has sparse local examples. The UI can then disclose a
# regional fallback instead of silently excluding a village such as Chirner.
SPECIAL_LOCATIONS = {
    "BMC": ["Colaba", "Dadar", "Bandra", "Andheri", "Malad", "Borivali", "Kurla", "Chembur", "Ghatkopar", "Mulund"],
    "NMMC": ["Vashi", "Nerul", "Belapur", "Koparkhairane", "Ghansoli", "Airoli", "Sanpada"],
    "TMC": ["Thane City", "Panchpakhadi", "Ghodbunder Road", "Kalwa", "Mumbra", "Diva"],
    "KDMC": ["Kalyan East", "Kalyan West", "Dombivli", "Thakurli", "Titwala"],
    "MBMC": ["Mira Road", "Bhayandar East", "Bhayandar West"],
    "VVMC": ["Naigaon", "Vasai Road", "Nalasopara", "Virar"],
    "PMCP": ["Panvel City", "New Panvel", "Kamothe", "Khandeshwar", "Kharghar", "Kalamboli"],
    "UMC": ["Ulhasnagar", "Vitthalwadi"],
    "Rural / Council": ["Shahapur", "Vasind", "Asangaon", "Karjat", "Khopoli", "Badlapur", "Ambernath"],
    "Raigad District": ["Alibag", "Pen", "Karjat", "Khalapur", "Khopoli", "Mahad", "Mangaon", "Mhasla", "Murud", "Poladpur", "Roha", "Shrivardhan", "Sudhagad-Pali", "Tala"],
    "Uran Taluka (Raigad)": [
        "Antrabamdakhar", "Aware", "Bandhpada", "Belondakhar", "Bhendkhal", "Bhom", "Bokadvira", "Bori Bk.",
        "Boricha Kotha", "Boripakhadi", "Chanje", "Chikhali Bhom", "Chirle", "Chirner", "Dhasakhosi", "Dhutum",
        "Dighode", "Dongari", "Funde", "Gharapuri", "Govthane", "Hanuman Koliwada", "Harishchandra Pimpale", "Jasai",
        "Jaskhar", "Jui", "Juipunade", "Juna Sheva", "Kacherpada", "Kadape", "Kaladhonda", "Kalambusare", "Kanthavali",
        "Karal", "Kauli Bandhankhar", "Kauli Belodakhar", "Kegaon", "Koproli", "Mhatwali", "Muthekhar", "Nagaon", "Navghar",
        "Navin Sheva", "Pagote", "Pale", "Panje", "Paundkhar", "Pirkone", "Pohi", "Punade", "Ransai", "Ranwad",
        "Sangpalekhar", "Sarde", "Sawarkhar", "Shematikhar", "Sonari", "Taki", "Talbandkhar", "Uran", "Vasheni", "Veshvi",
        "Vindhane", "Waltikhar",
    ],
}


def municipality_for(locality: str) -> str:
    value = locality.casefold()
    for corporation, terms in CORPORATIONS.items():
        if any(re.search(r"(?<![a-z])" + re.escape(term) + r"(?![a-z])", value) for term in terms):
            return corporation
    return "BMC"


def load_listing_source(source_zip: Path) -> pd.DataFrame:
    """Normalize the two licensed public listing sources into one schema."""
    with zipfile.ZipFile(source_zip) as archive:
        csv_name = next(name for name in archive.namelist() if name.endswith(".csv"))
        raw = pd.read_csv(archive.open(csv_name), low_memory=False)

    if {"price", "area", "bedroom_num", "locality"}.issubset(raw.columns):
        df = raw.rename(columns={"area": "sqft", "bedroom_num": "bhk", "bathroom_num": "bathrooms"})
        return df[["price", "sqft", "bhk", "bathrooms", "age", "total_floors", "locality"]].copy()

    # Kaggle's Mumbai Real Estate Properties dataset (CC BY-SA 4.0).
    df = pd.DataFrame({
        "price": raw["Price"],
        "sqft": raw["Carpet Area"].fillna(raw["Covered Area"]),
        "bhk": raw["bedroom"],
        "bathrooms": raw["Bathroom"],
        "age": 0,
        "total_floors": raw["floors"],
        "locality": raw["Area Name"].fillna(raw["Location"]),
    })
    return df


def main(source_zips: list[Path], output: Path) -> None:
    df = pd.concat([load_listing_source(source_zip) for source_zip in source_zips], ignore_index=True)
    numeric = ["price", "sqft", "bhk", "bathrooms", "age", "total_floors"]
    df = df.dropna(subset=numeric + ["locality"])
    for column in numeric:
        df[column] = pd.to_numeric(df[column], errors="coerce")
    df = df.dropna(subset=numeric)
    df = df[(df.price > 500_000) & (df.price < 1_000_000_000) & (df.sqft >= 150) & (df.sqft <= 10_000)]
    df["locality"] = df.locality.astype(str).str.strip()
    df["municipality"] = df.locality.map(municipality_for)

    train_df, test_df = train_test_split(df, test_size=.2, random_state=42)
    target = np.log1p(train_df.price)
    global_prior = float(target.median())
    municipality_priors = train_df.assign(target=target).groupby("municipality").target.median().to_dict()
    locality_priors = train_df.assign(target=target).groupby("locality").target.agg(["median", "count"])
    locality_priors = locality_priors[locality_priors["count"] >= 3]["median"].to_dict()

    def make_features(source: pd.DataFrame) -> np.ndarray:
        locality_prior = source.locality.map(locality_priors)
        municipality_prior = source.municipality.map(municipality_priors).fillna(global_prior)
        locality_prior = locality_prior.fillna(municipality_prior)
        return np.column_stack((
            np.log1p(source.sqft), source.bhk, source.bathrooms, source.age, source.total_floors,
            locality_prior, municipality_prior,
        ))

    feature_names = ["log_sqft", "bhk", "bathrooms", "age", "total_floors", "locality_prior", "municipality_prior"]
    model = GradientBoostingRegressor(n_estimators=120, learning_rate=.045, max_depth=3, min_samples_leaf=16, loss="huber", random_state=42)
    model.fit(make_features(train_df), target)
    predicted_log = model.predict(make_features(test_df))
    predicted = np.expm1(predicted_log)
    actual = test_df.price.to_numpy()

    # Keep compact, real holdout records with their model predictions. The browser
    # uses these records to calculate charts for the visitor's current inputs.
    validation_source = test_df.assign(predicted=predicted)
    validation = {}
    for locality, group in validation_source.groupby("locality", sort=True):
        # A locality can have many near-identical listings. Cap each stored group
        # so diagnostics stay fast while retaining a reproducible spread of actuals.
        group = group.sort_values(["sqft", "bhk", "price"]).head(240)
        validation[locality] = [
            [
                int(round(row.price)), int(round(row.predicted)), int(row.bhk),
                int(round(row.sqft)), int(bool(row.age == 0)),
            ]
            for row in group.itertuples()
        ]

    coverage = {}
    locations = {}
    for municipality, group in df.groupby("municipality"):
        counts = group.locality.value_counts()
        locations[municipality] = sorted(counts[counts >= 3].index.tolist())
        coverage[municipality] = {"rows": int(len(group)), "localities": int(len(counts[counts >= 3]))}

    def pack_tree(tree):
        return [[int(tree.children_left[index]), int(tree.children_right[index]), int(tree.feature[index]), float(tree.threshold[index]), float(tree.value[index][0][0])] for index in range(tree.node_count)]

    export = {
        "model": "Gradient-boosted regression on log(price), trained from public Mumbai property listings",
        "source": "Merged public Mumbai listings: Kaggle 70k (Apache 2.0) + Mumbai Real Estate Properties (CC BY-SA 4.0)",
        "rows": int(len(df)),
        "metrics": {
            "holdout_mae_inr": round(float(mean_absolute_error(actual, predicted))),
            "holdout_r2": round(float(r2_score(actual, predicted)), 3),
        },
        "feature_names": feature_names,
        "initial_prediction": float(model.init_.constant_[0][0]),
        "learning_rate": float(model.learning_rate),
        "trees": [pack_tree(estimator[0].tree_) for estimator in model.estimators_],
        "global_prior": global_prior,
        "municipality_priors": {key: float(value) for key, value in municipality_priors.items()},
        "locality_priors": {key: float(value) for key, value in locality_priors.items()},
        "locations": locations,
        "coverage": coverage,
        "validation": validation,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(export, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(export["metrics"], indent=2))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit("Usage: python scripts/train-mmr-browser-model.py <source-zip> [...source-zip] <output-json>")
    main([Path(source) for source in sys.argv[1:-1]], Path(sys.argv[-1]))
