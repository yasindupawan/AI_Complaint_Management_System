import pandas as pd
import random
import re
from pathlib import Path

SEED_DATASET = Path("../datasets/nyc311_training_dataset.csv")
OUTPUT_DATASET = Path("../datasets/final_complaint_training_dataset_v2.csv")

RANDOM_STATE = 42
TARGET_PER_CATEGORY = 1000

random.seed(RANDOM_STATE)

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
    "This issue needs urgent attention.",
    "Residents are requesting assistance.",
    "Please resolve this problem as soon as possible.",
    "This is causing inconvenience to the public.",
    "Please send the responsible team to inspect the area.",
    "We would appreciate assistance with this problem.",
    "The problem has been continuing for some time.",
    "Please arrange an inspection.",
]

CATEGORY_TEMPLATES = {
    "roads": [
        "There is {issue_lower} {location}.",
        "The road has {issue_lower} {location}.",
        "We would like to report {issue_lower} {location}.",
        "Drivers are facing problems because of {issue_lower} {location}.",
        "The road surface is damaged due to {issue_lower} {location}.",
        "Please repair {issue_lower} {location}.",
        "{issue} is causing difficulties for vehicles {location}.",
        "Residents are concerned about {issue_lower} {location}.",
        "Vehicles are being affected by {issue_lower} {location}.",
        "The road needs attention because of {issue_lower} {location}.",
    ],

    "water_supply": [
        "We are experiencing {issue_lower} {location}.",
        "There is a water supply issue involving {issue_lower} {location}.",
        "Residents have reported {issue_lower} {location}.",
        "Please investigate the water problem caused by {issue_lower} {location}.",
        "{issue} is affecting the local water supply {location}.",
        "Our area is facing {issue_lower} {location}.",
        "There appears to be {issue_lower} {location}.",
        "Please check the water system because of {issue_lower} {location}.",
        "The water service is affected by {issue_lower} {location}.",
        "People in the area are experiencing {issue_lower} {location}.",
    ],

    "drainage": [
        "There is {issue_lower} {location}.",
        "The drainage system is affected by {issue_lower} {location}.",
        "Residents are reporting {issue_lower} {location}.",
        "{issue} is causing drainage problems {location}.",
        "Please inspect the drain because of {issue_lower} {location}.",
        "Wastewater problems have occurred due to {issue_lower} {location}.",
        "The drainage issue appears to involve {issue_lower} {location}.",
        "We need assistance with {issue_lower} {location}.",
        "The drain is causing problems because of {issue_lower} {location}.",
        "Please resolve the drainage issue involving {issue_lower} {location}.",
    ],

    "garbage": [
        "There is {issue_lower} {location}.",
        "There is a waste management problem involving {issue_lower} {location}.",
        "Residents have complained about {issue_lower} {location}.",
        "Please arrange cleaning because of {issue_lower} {location}.",
        "{issue} is creating an unsanitary condition {location}.",
        "Waste has become a problem due to {issue_lower} {location}.",
        "Please address {issue_lower} {location}.",
        "The area needs cleaning because of {issue_lower} {location}.",
        "Garbage collection is affected by {issue_lower} {location}.",
        "Residents are requesting action regarding {issue_lower} {location}.",
    ],

    "electricity": [
        "There is {issue_lower} {location}.",
        "We are experiencing an electrical problem involving {issue_lower} {location}.",
        "Residents have reported {issue_lower} {location}.",
        "Please inspect the electrical issue involving {issue_lower} {location}.",
        "{issue} is affecting the area {location}.",
        "The electricity service has a problem with {issue_lower} {location}.",
        "Please send a technician because of {issue_lower} {location}.",
        "There appears to be {issue_lower} {location}.",
        "The electrical system needs attention because of {issue_lower} {location}.",
        "People in the area are affected by {issue_lower} {location}.",
    ],

    "environment": [
        "There is an environmental issue involving {issue_lower} {location}.",
        "Residents are concerned about {issue_lower} {location}.",
        "Please investigate {issue_lower} {location}.",
        "{issue} is affecting the surrounding environment {location}.",
        "We have noticed {issue_lower} {location}.",
        "The area is affected by {issue_lower} {location}.",
        "Please inspect the environmental issue involving {issue_lower} {location}.",
        "People nearby have complained about {issue_lower} {location}.",
        "This environmental problem involves {issue_lower} {location}.",
        "Residents are requesting action regarding {issue_lower} {location}.",
    ],
}

def clean_descriptor(text):
    text = str(text)

    # Remove bracketed NYC internal codes
    text = re.sub(r"\([^)]*\)", "", text)

    # Remove known technical codes
    technical_codes = [
        "WLWP", "WA1", "WA2", "WA4", "WC1", "WC2",
        "WC3", "WC5", "WNW", "WHP", "QA1", "QA2",
        "QA3", "QA4", "QA5", "QA6", "QB1", "QBZ",
        "SA", "SA1", "SA2", "SA3", "SA4", "SC",
        "SC1", "SC4", "SE", "SJ", "SZZ",
        "HD1", "HQL", "HQS", "HA1", "HC1", "HC2",
    ]

    for code in technical_codes:
        text = re.sub(
            rf"\b{re.escape(code)}\b",
            "",
            text,
            flags=re.IGNORECASE,
        )

    # Remove leading operational codes such as E3, E3A, 1R, 2R etc.
    text = re.sub(
        r"^\s*(?:E\d+[A-Z]?|\d+[A-Z]{0,2})\s+",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Clean punctuation and spacing
    text = re.sub(r"\s*-\s*$", "", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip(" -:/")

def normalize_text(text):
    text = re.sub(r"\s+", " ", str(text))
    text = re.sub(r"\s+([,.!?])", r"\1", text)
    return text.strip()

print("=" * 70)
print("GENERATING CLEAN V2 TRAINING DATA")
print("=" * 70)

seed_df = pd.read_csv(SEED_DATASET)

required_columns = {"Descriptor", "category"}
missing = required_columns - set(seed_df.columns)

if missing:
    raise ValueError(f"Missing required seed columns: {missing}")

seed_df = (
    seed_df[["Descriptor", "category"]]
    .dropna()
    .drop_duplicates()
)

seed_df["clean_issue"] = seed_df["Descriptor"].apply(clean_descriptor)

seed_df = seed_df[
    seed_df["clean_issue"].str.len() >= 3
].copy()

print(f"\nClean unique seed mappings: {len(seed_df)}")

generated_rows = []

for category in sorted(seed_df["category"].unique()):

    category_seeds = seed_df[
        seed_df["category"] == category
    ].copy()

    templates = CATEGORY_TEMPLATES[category]
    category_rows = set()

    attempts = 0
    max_attempts = TARGET_PER_CATEGORY * 150

    while (
        len(category_rows) < TARGET_PER_CATEGORY
        and attempts < max_attempts
    ):
        attempts += 1

        seed = category_seeds.sample(
            1,
            random_state=random.randint(0, 10_000_000)
        ).iloc[0]

        issue = seed["clean_issue"]
        issue_lower = issue.lower()

        template = random.choice(templates)
        location = random.choice(LOCATIONS)

        sentence = template.format(
            issue=issue,
            issue_lower=issue_lower,
            location=location,
        )

        if random.random() < 0.65:
            sentence += " " + random.choice(ENDINGS)

        sentence = normalize_text(sentence)

        # Reject awkward colon-like constructions
        if re.search(
            r"\b(?:there is|there appears to be|i am reporting|we have noticed):",
            sentence,
            flags=re.IGNORECASE,
        ):
            continue

        # Reject remaining technical-code-looking tokens
        if re.search(
            r"\b(?:WLWP|WA\d+|SA\d*|QA\d+|HD\d+|HQL|HQS|HC\d+)\b",
            sentence,
            flags=re.IGNORECASE,
        ):
            continue

        category_rows.add(sentence)

    print(
        f"{category}: generated "
        f"{len(category_rows):,} clean unique examples"
    )

    for sentence in category_rows:
        generated_rows.append({
            "complaint_text": sentence,
            "category": category,
            "language": "english",
            "source": "NYC311_seed_controlled_augmentation_v2",
        })

final_df = pd.DataFrame(generated_rows)

# Remove exact duplicate text
final_df = final_df.drop_duplicates(
    subset=["complaint_text"]
)

# Remove text appearing under more than one category
category_count_per_text = (
    final_df.groupby("complaint_text")["category"]
    .nunique()
)

ambiguous_texts = category_count_per_text[
    category_count_per_text > 1
].index

final_df = final_df[
    ~final_df["complaint_text"].isin(ambiguous_texts)
].copy()

# Balance categories
minimum_size = (
    final_df["category"]
    .value_counts()
    .min()
)

final_target = min(
    TARGET_PER_CATEGORY,
    minimum_size,
)

balanced_frames = []

for category in sorted(final_df["category"].unique()):

    category_df = final_df[
        final_df["category"] == category
    ].sample(
        n=final_target,
        random_state=RANDOM_STATE,
    )

    balanced_frames.append(category_df)

final_df = pd.concat(
    balanced_frames,
    ignore_index=True,
)

final_df = final_df.sample(
    frac=1,
    random_state=RANDOM_STATE,
).reset_index(drop=True)

final_df.to_csv(
    OUTPUT_DATASET,
    index=False,
    encoding="utf-8",
)

print("\n" + "=" * 70)
print("V2 DATASET CREATED")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_DATASET}")
print(f"\nShape: {final_df.shape}")

print("\nCategory Distribution:")
print(
    final_df["category"]
    .value_counts()
    .sort_index()
)

print(
    "\nDuplicate Complaint Texts:",
    final_df["complaint_text"]
    .duplicated()
    .sum()
)

print(
    "Unique Complaint Texts:",
    final_df["complaint_text"].nunique()
)

print("\nSample Records:")
print(
    final_df[
        ["complaint_text", "category"]
    ]
    .head(20)
    .to_string(index=False)
)