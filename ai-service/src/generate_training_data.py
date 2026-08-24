import pandas as pd
import random
import re
from pathlib import Path

# =========================================================
# CONFIGURATION
# =========================================================

SEED_DATASET = Path("../datasets/nyc311_training_dataset.csv")
OUTPUT_DATASET = Path("../datasets/final_complaint_training_dataset.csv")

RANDOM_STATE = 42
TARGET_PER_CATEGORY = 1000

random.seed(RANDOM_STATE)

# =========================================================
# NATURAL LANGUAGE VARIATIONS
# =========================================================

OPENERS = [
    "There is",
    "I would like to report",
    "Please check",
    "We have noticed",
    "Residents have reported",
    "There appears to be",
    "I am reporting",
    "We are experiencing",
    "There has been",
    "Our area has",
]

LOCATIONS = [
    "near our house",
    "on the main road",
    "near the school",
    "close to the bus stop",
    "near the public market",
    "in our neighbourhood",
    "along the roadside",
    "near the junction",
    "close to the town centre",
    "in the residential area",
    "near the hospital",
    "outside our building",
]

ENDINGS = [
    "Please investigate this issue.",
    "Please take the necessary action.",
    "This issue needs attention.",
    "Residents are requesting assistance.",
    "Please resolve this problem as soon as possible.",
    "This is causing inconvenience to the public.",
    "Please send the responsible team to inspect the area.",
    "We would appreciate assistance with this issue.",
    "The problem has been continuing for some time.",
    "Please arrange an inspection.",
]

# =========================================================
# CATEGORY-SPECIFIC NATURAL LANGUAGE TEMPLATES
# =========================================================

CATEGORY_TEMPLATES = {
    "roads": [
        "{issue} {location}.",
        "There is {issue_lower} {location}.",
        "The road has {issue_lower} {location}.",
        "Drivers are having difficulty because of {issue_lower} {location}.",
        "The road surface is affected by {issue_lower} {location}.",
        "Please repair {issue_lower} {location}.",
        "{issue} is causing problems for vehicles {location}.",
        "Residents are concerned about {issue_lower} {location}.",
    ],

    "water_supply": [
        "We are experiencing {issue_lower} {location}.",
        "There is a water supply problem involving {issue_lower} {location}.",
        "Residents have reported {issue_lower} {location}.",
        "Please investigate the water issue: {issue_lower} {location}.",
        "{issue} has affected the local water supply {location}.",
        "Our area is facing {issue_lower} {location}.",
        "There appears to be {issue_lower} {location}.",
        "Please check the water system because of {issue_lower} {location}.",
    ],

    "drainage": [
        "There is {issue_lower} {location}.",
        "The drainage system has {issue_lower} {location}.",
        "Residents are reporting {issue_lower} {location}.",
        "{issue} is affecting the area {location}.",
        "Please inspect the drain because of {issue_lower} {location}.",
        "Wastewater is causing problems due to {issue_lower} {location}.",
        "The drainage problem appears to involve {issue_lower} {location}.",
        "We need assistance with {issue_lower} {location}.",
    ],

    "garbage": [
        "There is {issue_lower} {location}.",
        "Garbage-related problems include {issue_lower} {location}.",
        "Residents have complained about {issue_lower} {location}.",
        "Please arrange cleaning because of {issue_lower} {location}.",
        "{issue} is creating an unsanitary condition {location}.",
        "Waste has become a problem due to {issue_lower} {location}.",
        "Please address {issue_lower} {location}.",
        "The area needs cleaning because of {issue_lower} {location}.",
    ],

    "electricity": [
        "There is {issue_lower} {location}.",
        "We are experiencing an electrical problem involving {issue_lower} {location}.",
        "Residents have reported {issue_lower} {location}.",
        "Please inspect the electrical issue: {issue_lower} {location}.",
        "{issue} is affecting the area {location}.",
        "The electricity service has a problem with {issue_lower} {location}.",
        "Please send a technician because of {issue_lower} {location}.",
        "There appears to be {issue_lower} {location}.",
    ],

    "environment": [
        "There is an environmental problem involving {issue_lower} {location}.",
        "Residents are concerned about {issue_lower} {location}.",
        "Please investigate {issue_lower} {location}.",
        "{issue} is affecting the surrounding environment {location}.",
        "We have noticed {issue_lower} {location}.",
        "The area is affected by {issue_lower} {location}.",
        "Please inspect this environmental issue: {issue_lower} {location}.",
        "People nearby have complained about {issue_lower} {location}.",
    ],
}

# =========================================================
# TEXT CLEANING
# =========================================================

def clean_descriptor(text):
    """
    Remove NYC internal codes such as (WA2), (SA), etc.
    and make the descriptor more natural.
    """
    text = str(text)

    # Remove bracket codes/content
    text = re.sub(r"\([^)]*\)", "", text)

    # Remove repeated spaces
    text = re.sub(r"\s+", " ", text)

    # Remove some technical prefixes
    text = text.replace("E3A ", "")
    text = text.replace("E3 ", "")
    text = text.replace("E1 ", "")
    text = text.replace("E2 ", "")
    text = text.replace("E5 ", "")
    text = text.replace("1R ", "")
    text = text.replace("1RB ", "")
    text = text.replace("1RG ", "")
    text = text.replace("2R ", "")
    text = text.replace("1 ", "")
    text = text.replace("2 ", "")

    return text.strip(" -")


def normalize_text(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# =========================================================
# LOAD SEED TAXONOMY
# =========================================================

print("=" * 70)
print("GENERATING NATURAL-LANGUAGE TRAINING DATA")
print("=" * 70)

seed_df = pd.read_csv(SEED_DATASET)

required_columns = {"Descriptor", "category"}

missing = required_columns - set(seed_df.columns)

if missing:
    raise ValueError(
        f"Missing required seed columns: {missing}"
    )

seed_df = seed_df[
    ["Descriptor", "category"]
].drop_duplicates()

seed_df = seed_df.dropna()

print(f"\nUnique seed mappings: {len(seed_df)}")

# =========================================================
# GENERATE DATA
# =========================================================

generated_rows = []

for category in sorted(seed_df["category"].unique()):

    category_seeds = seed_df[
        seed_df["category"] == category
    ].copy()

    templates = CATEGORY_TEMPLATES[category]

    category_rows = set()

    attempts = 0
    max_attempts = TARGET_PER_CATEGORY * 100

    while (
        len(category_rows) < TARGET_PER_CATEGORY
        and attempts < max_attempts
    ):
        attempts += 1

        seed = category_seeds.sample(
            1,
            random_state=random.randint(0, 10_000_000)
        ).iloc[0]

        raw_issue = clean_descriptor(
            seed["Descriptor"]
        )

        issue = raw_issue
        issue_lower = raw_issue.lower()

        template = random.choice(templates)
        location = random.choice(LOCATIONS)

        sentence = template.format(
            issue=issue,
            issue_lower=issue_lower,
            location=location,
        )

        # Randomly add an ending
        if random.random() < 0.65:
            sentence += " " + random.choice(ENDINGS)

        # Occasionally add a generic opener
        if random.random() < 0.20:
            opener = random.choice(OPENERS)

            if not sentence.lower().startswith(
                opener.lower()
            ):
                sentence = f"{opener}: {sentence}"

        sentence = normalize_text(sentence)

        category_rows.add(sentence)

    print(
        f"{category}: generated "
        f"{len(category_rows):,} unique examples"
    )

    for sentence in category_rows:
        generated_rows.append(
            {
                "complaint_text": sentence,
                "category": category,
                "language": "english",
                "source": "NYC311_seed_controlled_augmentation",
            }
        )

# =========================================================
# CREATE FINAL DATAFRAME
# =========================================================

final_df = pd.DataFrame(generated_rows)

# Exact duplicate removal
final_df = final_df.drop_duplicates(
    subset=["complaint_text"]
)

# Detect text appearing under multiple categories
ambiguous = (
    final_df.groupby("complaint_text")["category"]
    .nunique()
)

ambiguous_texts = ambiguous[
    ambiguous > 1
].index

final_df = final_df[
    ~final_df["complaint_text"].isin(
        ambiguous_texts
    )
].copy()

# =========================================================
# FINAL BALANCING
# =========================================================

balanced_frames = []

minimum_category_size = (
    final_df["category"]
    .value_counts()
    .min()
)

final_target = min(
    TARGET_PER_CATEGORY,
    minimum_category_size
)

for category in sorted(
    final_df["category"].unique()
):
    category_df = final_df[
        final_df["category"] == category
    ]

    category_df = category_df.sample(
        n=final_target,
        random_state=RANDOM_STATE,
    )

    balanced_frames.append(category_df)

final_df = pd.concat(
    balanced_frames,
    ignore_index=True
)

final_df = final_df.sample(
    frac=1,
    random_state=RANDOM_STATE,
).reset_index(drop=True)

# =========================================================
# SAVE
# =========================================================

final_df.to_csv(
    OUTPUT_DATASET,
    index=False,
    encoding="utf-8",
)

# =========================================================
# QUALITY REPORT
# =========================================================

print("\n" + "=" * 70)
print("FINAL TRAINING DATASET")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_DATASET}")

print(
    f"\nDataset Shape: {final_df.shape}"
)

print("\nCategory Distribution:")
print(
    final_df["category"]
    .value_counts()
    .sort_index()
)

print(
    "\nExact duplicate complaint texts:",
    final_df["complaint_text"]
    .duplicated()
    .sum()
)

print(
    "Unique complaint texts:",
    final_df["complaint_text"]
    .nunique()
)

print("\nLanguage Distribution:")
print(
    final_df["language"]
    .value_counts()
)

print("\nSample Records:")
print(
    final_df[
        ["complaint_text", "category"]
    ].head(15).to_string(index=False)
)