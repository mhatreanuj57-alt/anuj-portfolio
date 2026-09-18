"""Attach real holdout records to an already-exported browser model.

The held-out records contain actual public listing price, browser-model
prediction, BHK, carpet area, and inferred property condition. They power
input-responsive diagnostics without a server.
"""
import json
import runpy
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def predict(model, row):
    municipality_prior = model["municipality_priors"].get(row.municipality, model["global_prior"])
    locality_prior = model["locality_priors"].get(row.locality, municipality_prior)
    features = [np.log1p(row.sqft), row.bhk, row.bathrooms, row.age, row.total_floors, locality_prior, municipality_prior]
    score = model["initial_prediction"]
    for tree in model["trees"]:
        node = 0
        while tree[node][0] != -1:
            left, right, feature, threshold, _ = tree[node]
            node = left if features[feature] <= threshold else right
        score += model["learning_rate"] * tree[node][4]
    return max(500_000, np.expm1(score))


def main(sources, output):
    trainer = runpy.run_path(str(Path(__file__).with_name("train-mmr-browser-model.py")))
    listing_loader, municipality_for = trainer["load_listing_source"], trainer["municipality_for"]
    df = pd.concat([listing_loader(Path(source)) for source in sources], ignore_index=True)
    numeric = ["price", "sqft", "bhk", "bathrooms", "age", "total_floors"]
    df = df.dropna(subset=numeric + ["locality"])
    for column in numeric:
        df[column] = pd.to_numeric(df[column], errors="coerce")
    df = df.dropna(subset=numeric)
    df = df[(df.price > 500_000) & (df.price < 1_000_000_000) & (df.sqft >= 150) & (df.sqft <= 10_000)]
    df["locality"] = df.locality.astype(str).str.strip()
    df["municipality"] = df.locality.map(municipality_for)
    model = json.loads(Path(output).read_text(encoding="utf-8"))
    _, holdout = train_test_split(df, test_size=.2, random_state=42)
    # Only package locations presented in the portfolio selector. This keeps
    # the client payload small while covering the MMR framework requested here.
    selected = {
        "airoli", "vashi", "sanpada", "koper khairane", "ghansoli", "nerul", "belapur",
        "panvel", "old panvel", "kamothe", "khandeshwar", "kharghar", "kalamboli", "taloja", "ulwe",
        "colaba", "dadar", "bandra", "andheri", "malad", "borivali", "kurla", "chembur", "ghatkopar", "mulund",
        "thane", "panch pakhdi", "kasaradavali thane", "kalwa", "mumbra", "diva",
        "kalyan east", "kalyan west", "dombivli", "thakurli", "titwala", "mira road", "bhayandar",
        "naigaon", "vasai", "nalasopara", "virar", "ulhasnagar", "vitthalwadi", "shahapur", "vasind",
        "asangaon", "karjat", "khopoli", "badlapur", "ambernath", "chikhal dongari", "koproli", "navghar",
    }
    holdout = holdout[holdout.locality.str.casefold().isin(selected)]
    validation = {}
    for locality, group in holdout.groupby("locality", sort=True):
        group = group.sort_values(["sqft", "bhk", "price"]).head(240)
        validation[locality] = [
            [int(round(row.price)), int(round(predict(model, row))), int(row.bhk), int(round(row.sqft)), int(row.age == 0)]
            for row in group.itertuples()
        ]
    model["validation"] = validation
    Path(output).write_text(json.dumps(model, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Packed {sum(map(len, validation.values()))} real holdout records across {len(validation)} localities.")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        raise SystemExit("Usage: python scripts/pack-mmr-validation.py <source-zip> [...source-zip] <model-json>")
    main(sys.argv[1:-1], sys.argv[-1])
