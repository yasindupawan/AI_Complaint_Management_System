import random
import re
from pathlib import Path

import pandas as pd


# =========================================================
# CONFIGURATION
# =========================================================

RANDOM_STATE = 42

random.seed(RANDOM_STATE)

CURRENT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = CURRENT_DIR.parent

PRIORITY_DATA_DIR = (
    AI_SERVICE_DIR
    / "datasets"
    / "priority"
)

INPUT_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v2.csv"
)

OUTPUT_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v3.csv"
)

AUGMENTED_RECORDS_PER_PRIORITY = 500

TARGET_RECORDS_PER_PRIORITY = 1500


# =========================================================
# SHARED LOCATIONS
# =========================================================

LOCATIONS = [
    "near the school",
    "outside the school",
    "near the hospital",
    "outside the hospital",
    "near the public market",
    "close to the bus stop",
    "near the railway station",
    "at the village entrance",
    "in our neighbourhood",
    "near our houses",
    "along the main road",
    "beside the public road",
    "near the junction",
    "close to the town centre",
    "in the residential area",
    "near the community centre",
    "outside our building",
    "near the playground",
    "beside the public walkway",
    "close to the local clinic",
]


# =========================================================
# LOW PRIORITY CONFIGURATION
# =========================================================

LOW_CONFIG = {
    "issues": [
        "one street lamp is dim but still provides some light",
        "a small crack has appeared along the edge of the road",
        "a shallow pothole has started forming on a quiet side road",
        "a public bin is partly full but is not overflowing",
        "a few pieces of litter are scattered beside the walkway",
        "a minor water leak is dripping slowly from a public pipe",
        "the water pressure is slightly lower than normal in one house",
        "tap water has a slight unusual smell but remains available",
        "a roadside drain contains some leaves but water can still pass",
        "a curb has a small chipped section",
        "a shallow puddle forms after light rain",
        "one street sign is slightly damaged but still readable",
        "a small patch of road surface has become uneven",
        "a street lamp flickers occasionally but remains usable",
        "a small amount of rubbish has been left near a public bin",
        "a drain grate is loose and makes a noise when vehicles pass",
        "a minor crack is visible in the pavement",
        "one household is experiencing slightly reduced water pressure",
        "a small amount of dust is affecting one section of the road",
        "a public waste container has a damaged lid but can still be used",
    ],

    "effects": [
        "the issue is causing only a minor inconvenience",
        "normal access to the area is still possible",
        "the problem is limited to a small section",
        "there is no immediate safety risk",
        "the service remains available despite the issue",
        "the condition should be checked before it becomes worse",
        "residents can still use the area normally",
        "the issue is noticeable but not currently dangerous",
    ],
}


# =========================================================
# MEDIUM PRIORITY CONFIGURATION
# =========================================================

MEDIUM_CONFIG = {
    "issues": [
        "several street lights along the road are not working",
        "garbage collection has been missed for several days and waste is accumulating",
        "a roadside drain is blocked and rainwater is collecting across part of the road",
        "water supply has been unavailable to several houses since yesterday",
        "water pressure is too low for many houses in the area",
        "a water pipe is leaking continuously and wasting a large amount of water",
        "several potholes are making vehicles slow down and change direction",
        "a section of road has sunk and vehicles must drive around it",
        "the road surface is badly cracked and uneven",
        "wastewater is overflowing from a drain onto the roadside",
        "a sewer blockage is producing a strong smell across nearby properties",
        "residents are experiencing repeated power cuts during the evening",
        "a public area has accumulated a large amount of uncollected rubbish",
        "a drainage channel is blocked and causes flooding during normal rainfall",
        "smoke from a nearby workshop is regularly entering nearby houses",
        "multiple damaged sections of road are affecting normal traffic",
        "a group of street lamps is not functioning at night",
        "water service keeps stopping for several hours at a time",
        "an overflowing public bin is spreading waste across the surrounding area",
        "a drainage outlet is partially blocked and dirty water reaches the walkway",
    ],

    "effects": [
        "several residents are affected by the problem",
        "the issue is disrupting normal use of the area",
        "the problem has continued for more than a day",
        "residents are requesting prompt attention",
        "the issue is causing significant inconvenience",
        "the situation becomes worse during rainfall",
        "multiple households have reported the same problem",
        "the area can still be used but with difficulty",
        "the problem should be addressed before it becomes dangerous",
        "normal daily activities are being affected",
    ],
}


# =========================================================
# HIGH PRIORITY CONFIGURATION
# =========================================================

HIGH_CONFIG = {
    "issues": [
        "a live electrical wire is lying across a pedestrian path",
        "an exposed electrical cable is hanging where people can touch it",
        "electrical wires are sparking beside a crowded public area",
        "a damaged electrical pole is leaning over a busy road",
        "a fallen lamp post is blocking part of the road with electrical wires attached",
        "floodwater has entered several houses and is continuing to rise",
        "sewage is flowing into homes from an overflowing manhole",
        "a chemical liquid has spilled near houses and is producing strong fumes",
        "thick black smoke is filling nearby houses and residents are struggling to breathe",
        "a deep hole has opened across most of the traffic lane",
        "part of a roadside retaining wall has collapsed onto the traffic lane",
        "a major road section has collapsed and vehicles are approaching the damaged area",
        "a strong chemical release is affecting people in nearby homes",
        "a high-voltage cable has fallen beside a public walkway",
        "an electrical box is open and live components are exposed to pedestrians",
        "floodwater is rising quickly around homes and residents cannot leave safely",
        "a large tree has fallen onto electrical lines above the road",
        "dense smoke is causing breathing difficulty among nearby residents",
        "a large chemical spill is spreading across a public road",
        "a damaged power pole appears ready to fall onto passing vehicles",
    ],

    "effects": [
        "someone could be seriously injured if the area is not secured immediately",
        "the situation presents an immediate danger to the public",
        "residents are at risk of serious injury",
        "urgent intervention is required",
        "people are being exposed to a serious safety hazard",
        "the area should be secured immediately",
        "the problem could cause a major accident",
        "residents may need emergency assistance",
        "public access to the area is unsafe",
        "the condition poses a direct risk to life and safety",
    ],
}


PRIORITY_CONFIG = {
    "low": LOW_CONFIG,
    "medium": MEDIUM_CONFIG,
    "high": HIGH_CONFIG,
}


# =========================================================
# REQUEST PHRASES
# =========================================================

REQUESTS = [
    "Please inspect the issue.",
    "Please take the necessary action.",
    "Residents are requesting assistance.",
    "Please arrange an inspection.",
    "Please send the responsible team.",
    "We would appreciate assistance with this problem.",
    "Please address this issue.",
    "The relevant department should investigate the problem.",
    "",
]


# =========================================================
# NATURAL TEMPLATES
# =========================================================

SHORT_TEMPLATES = [
    "{issue} {location}.",
    "{issue} {location}. {request}",
    "Residents report that {issue} {location}.",
    "We would like to report that {issue} {location}.",
    "{location}, {issue}.",
]


LONG_TEMPLATES = [
    "{issue} {location}. {effect}. {request}",

    "Residents have reported that {issue} {location}. "
    "{effect}. {request}",

    "People living nearby have noticed that {issue} {location}. "
    "{effect}. {request}",

    "There is a public complaint because {issue} {location}. "
    "{effect}. {request}",

    "The community would like to report that {issue} {location}. "
    "{effect}. {request}",

    "{location}, {issue}. "
    "{effect}. {request}",

    "We are experiencing a situation where {issue} {location}. "
    "{effect}. {request}",
]


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text):
    text = str(text)

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    text = re.sub(
        r"\s+([,.!?])",
        r"\1",
        text,
    )

    return text.strip()


# =========================================================
# NORMALIZATION
# =========================================================

def normalize_text(text):
    text = clean_text(text).lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        "",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# =========================================================
# GENERATE ONE PRIORITY EXAMPLE
# =========================================================

def generate_single_priority_example(
    priority,
):
    config = PRIORITY_CONFIG[
        priority
    ]

    issue = random.choice(
        config["issues"]
    )

    location = random.choice(
        LOCATIONS
    )

    effect = random.choice(
        config["effects"]
    )

    request = random.choice(
        REQUESTS
    )

    if random.random() < 0.30:
        template = random.choice(
            SHORT_TEMPLATES
        )

    else:
        template = random.choice(
            LONG_TEMPLATES
        )

    complaint = template.format(
        issue=issue,
        location=location,
        effect=effect,
        request=request,
    )

    return clean_text(
        complaint
    )


# =========================================================
# GENERATE UNIQUE PRIORITY EXAMPLES
# =========================================================

def generate_priority_examples(
    priority,
    number_of_examples,
    existing_normalized_texts=None,
):
    if existing_normalized_texts is None:
        existing_normalized_texts = set()

    generated_examples = []

    generated_normalized = set()

    maximum_attempts = (
        max(
            number_of_examples,
            1,
        )
        * 300
    )

    attempts = 0

    while (
        len(generated_examples)
        < number_of_examples
        and
        attempts < maximum_attempts
    ):
        attempts += 1

        complaint = (
            generate_single_priority_example(
                priority
            )
        )

        if len(
            complaint.split()
        ) < 6:
            continue

        normalized = normalize_text(
            complaint
        )

        if not normalized:
            continue

        if (
            normalized
            in existing_normalized_texts
        ):
            continue

        if (
            normalized
            in generated_normalized
        ):
            continue

        generated_examples.append(
            complaint
        )

        generated_normalized.add(
            normalized
        )

    if (
        len(generated_examples)
        < number_of_examples
    ):
        raise RuntimeError(
            f"Unable to generate enough unique "
            f"'{priority}' examples. "
            f"Generated "
            f"{len(generated_examples)} / "
            f"{number_of_examples}."
        )

    return generated_examples


# =========================================================
# LOAD V2 PRIORITY DATASET
# =========================================================

print("=" * 75)
print("BUILD PRIORITY TRAINING DATASET V3")
print("=" * 75)

if not INPUT_DATASET.exists():
    raise FileNotFoundError(
        f"Input dataset not found:\n"
        f"{INPUT_DATASET}"
    )


v2_df = pd.read_csv(
    INPUT_DATASET
)


required_columns = {
    "complaint_text",
    "priority",
}


missing_columns = (
    required_columns
    - set(v2_df.columns)
)


if missing_columns:
    raise ValueError(
        "Missing required columns: "
        f"{sorted(missing_columns)}"
    )


v2_df = (
    v2_df[
        [
            "complaint_text",
            "priority",
        ]
    ]
    .dropna()
    .copy()
)


v2_df["complaint_text"] = (
    v2_df["complaint_text"]
    .astype(str)
    .map(clean_text)
)


v2_df["priority"] = (
    v2_df["priority"]
    .astype(str)
    .str.strip()
    .str.lower()
)


print(
    f"\nV2 Dataset Shape: "
    f"{v2_df.shape}"
)


print(
    "\nV2 Priority Distribution:"
)


print(
    v2_df["priority"]
    .value_counts()
    .sort_index()
)


# =========================================================
# VALIDATE LABELS
# =========================================================

expected_priorities = {
    "low",
    "medium",
    "high",
}


actual_priorities = set(
    v2_df["priority"].unique()
)


if actual_priorities != expected_priorities:
    raise ValueError(
        "Unexpected priority labels detected. "
        f"Found: {sorted(actual_priorities)}"
    )


# =========================================================
# EXISTING NORMALIZED TEXTS
# =========================================================

existing_normalized_texts = set(
    v2_df["complaint_text"]
    .map(normalize_text)
)


# =========================================================
# GENERATE TARGETED AUGMENTATION
# =========================================================

print("\n" + "=" * 75)
print("GENERATING PRIORITY HARD EXAMPLES")
print("=" * 75)


augmentation_records = []


for priority in [
    "low",
    "medium",
    "high",
]:

    examples = (
        generate_priority_examples(
            priority,
            AUGMENTED_RECORDS_PER_PRIORITY,
            existing_normalized_texts,
        )
    )

    for complaint_text in examples:

        normalized = normalize_text(
            complaint_text
        )

        existing_normalized_texts.add(
            normalized
        )

        augmentation_records.append(
            {
                "complaint_text":
                    complaint_text,

                "priority":
                    priority,

                "source":
                    "v3_targeted_augmentation",
            }
        )

    print(
        f"{priority:10} : "
        f"{len(examples)} generated"
    )


augmentation_df = pd.DataFrame(
    augmentation_records
)


print(
    f"\nGenerated Records: "
    f"{len(augmentation_df)}"
)


# =========================================================
# MARK ORIGINAL DATA
# =========================================================

v2_df["source"] = (
    "v2_original"
)


# =========================================================
# COMBINE
# =========================================================

combined_df = pd.concat(
    [
        v2_df,
        augmentation_df,
    ],
    ignore_index=True,
)


# =========================================================
# NORMALIZED DUPLICATE CHECK
# =========================================================

combined_df[
    "normalized_text"
] = (
    combined_df[
        "complaint_text"
    ]
    .map(
        normalize_text
    )
)


before_deduplication = len(
    combined_df
)


combined_df = (
    combined_df
    .drop_duplicates(
        subset=[
            "normalized_text",
        ],
        keep="first",
    )
    .copy()
)


after_deduplication = len(
    combined_df
)


removed_duplicates = (
    before_deduplication
    - after_deduplication
)


# =========================================================
# CONFLICTING LABEL CHECK
# =========================================================

label_counts = (
    combined_df
    .groupby(
        "normalized_text"
    )["priority"]
    .nunique()
)


conflicting_texts = (
    label_counts[
        label_counts > 1
    ]
    .index
)


if len(conflicting_texts) > 0:

    print(
        "\nWARNING: "
        "Conflicting priority labels detected."
    )

    conflicts = (
        combined_df[
            combined_df[
                "normalized_text"
            ].isin(
                conflicting_texts
            )
        ]
    )

    print(
        conflicts[
            [
                "complaint_text",
                "priority",
                "source",
            ]
        ]
        .head(30)
        .to_string(
            index=False
        )
    )

    raise ValueError(
        "Priority dataset contains "
        "conflicting labels."
    )


# =========================================================
# RESTORE PERFECT CLASS BALANCE
# =========================================================

print("\n" + "=" * 75)
print("RESTORING PERFECT CLASS BALANCE")
print("=" * 75)


current_normalized_texts = set(
    combined_df[
        "normalized_text"
    ]
)


balance_repair_records = []


for priority in [
    "low",
    "medium",
    "high",
]:

    current_count = len(
        combined_df[
            combined_df["priority"]
            == priority
        ]
    )

    missing_count = (
        TARGET_RECORDS_PER_PRIORITY
        - current_count
    )

    print(
        f"\n{priority.upper()}:"
    )

    print(
        f"Current Count : {current_count}"
    )

    print(
        f"Target Count  : "
        f"{TARGET_RECORDS_PER_PRIORITY}"
    )

    if missing_count <= 0:

        print(
            "Balance Repair: Not required"
        )

        continue

    print(
        f"Missing       : {missing_count}"
    )

    replacement_examples = (
        generate_priority_examples(
            priority,
            missing_count,
            current_normalized_texts,
        )
    )

    for complaint_text in (
        replacement_examples
    ):

        normalized = normalize_text(
            complaint_text
        )

        current_normalized_texts.add(
            normalized
        )

        balance_repair_records.append(
            {
                "complaint_text":
                    complaint_text,

                "priority":
                    priority,

                "source":
                    "v3_balance_repair",

                "normalized_text":
                    normalized,
            }
        )

    print(
        f"Balance Repair: "
        f"{len(replacement_examples)} "
        f"new unique examples added"
    )


if balance_repair_records:

    balance_repair_df = (
        pd.DataFrame(
            balance_repair_records
        )
    )

    combined_df = pd.concat(
        [
            combined_df,
            balance_repair_df,
        ],
        ignore_index=True,
    )


# =========================================================
# FINAL DUPLICATE VALIDATION
# =========================================================

final_duplicate_count = (
    combined_df[
        "normalized_text"
    ]
    .duplicated()
    .sum()
)


if final_duplicate_count > 0:
    raise ValueError(
        "Duplicate texts remain after "
        "balance repair."
    )


# =========================================================
# FINAL CONFLICT VALIDATION
# =========================================================

final_label_counts = (
    combined_df
    .groupby(
        "normalized_text"
    )["priority"]
    .nunique()
)


final_conflicting_texts = (
    final_label_counts[
        final_label_counts > 1
    ]
)


if len(
    final_conflicting_texts
) > 0:
    raise ValueError(
        "Conflicting labels remain in "
        "the final V3 dataset."
    )


# =========================================================
# REMOVE HELPER COLUMN
# =========================================================

combined_df = (
    combined_df
    .drop(
        columns=[
            "normalized_text",
        ]
    )
)


# =========================================================
# SHUFFLE
# =========================================================

combined_df = (
    combined_df
    .sample(
        frac=1,
        random_state=RANDOM_STATE,
    )
    .reset_index(
        drop=True
    )
)


# =========================================================
# FINAL QUALITY CHECK
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY V3 DATASET QUALITY CHECK")
print("=" * 75)


print(
    f"\nOriginal V2 Records : "
    f"{len(v2_df)}"
)


print(
    f"Initially Augmented : "
    f"{len(augmentation_df)}"
)


print(
    f"Duplicates Removed  : "
    f"{removed_duplicates}"
)


print(
    f"Balance Repairs     : "
    f"{len(balance_repair_records)}"
)


print(
    f"Final V3 Shape      : "
    f"{combined_df.shape}"
)


# =========================================================
# FINAL DISTRIBUTION
# =========================================================

priority_distribution = (
    combined_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)


print(
    "\nFinal Priority Distribution:"
)


print(
    priority_distribution
)


# =========================================================
# STRICT BALANCE VALIDATION
# =========================================================

expected_distribution = {
    "high":
        TARGET_RECORDS_PER_PRIORITY,

    "low":
        TARGET_RECORDS_PER_PRIORITY,

    "medium":
        TARGET_RECORDS_PER_PRIORITY,
}


actual_distribution = (
    priority_distribution
    .to_dict()
)


if (
    actual_distribution
    != expected_distribution
):

    raise ValueError(
        "Final V3 dataset is not perfectly "
        "balanced. "
        f"Found: {actual_distribution}"
    )


print(
    "\nPriority balance: PERFECT"
)


# =========================================================
# FINAL RECORD VALIDATION
# =========================================================

expected_total_records = (
    TARGET_RECORDS_PER_PRIORITY
    * 3
)


if (
    len(combined_df)
    != expected_total_records
):

    raise ValueError(
        "Unexpected final dataset size. "
        f"Expected {expected_total_records}, "
        f"found {len(combined_df)}."
    )


print(
    f"Final total validation: "
    f"PASS ({expected_total_records} records)"
)


# =========================================================
# SOURCE DISTRIBUTION
# =========================================================

print(
    "\nSource Distribution:"
)


print(
    combined_df[
        "source"
    ]
    .value_counts()
)


# =========================================================
# SAMPLE V3 EXAMPLES
# =========================================================

print("\n" + "=" * 75)
print("SAMPLE PRIORITY V3 HARD EXAMPLES")
print("=" * 75)


for priority in [
    "low",
    "medium",
    "high",
]:

    print(
        f"\n--- {priority.upper()} ---"
    )

    priority_augmented = (
        combined_df[
            (
                combined_df[
                    "priority"
                ]
                == priority
            )
            &
            (
                combined_df[
                    "source"
                ].isin(
                    [
                        "v3_targeted_augmentation",
                        "v3_balance_repair",
                    ]
                )
            )
        ]
    )

    sample_size = min(
        8,
        len(
            priority_augmented
        ),
    )

    if sample_size == 0:

        print(
            "No augmented examples found."
        )

        continue

    samples = (
        priority_augmented
        .sample(
            n=sample_size,
            random_state=RANDOM_STATE,
        )
    )

    for number, text in enumerate(
        samples[
            "complaint_text"
        ],
        start=1,
    ):

        print(
            f"{number:02}. "
            f"{text}"
        )


# =========================================================
# SAVE DATASET
# =========================================================

combined_df.to_csv(
    OUTPUT_DATASET,
    index=False,
)


print("\n" + "=" * 75)
print("PRIORITY V3 DATASET SAVED SUCCESSFULLY")
print("=" * 75)


print(
    f"\nOutput File:\n"
    f"{OUTPUT_DATASET}"
)


print(
    f"\nFinal Records: "
    f"{len(combined_df)}"
)


print(
    "\nFinal Distribution:"
)


print(
    combined_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)


print(
    "\nIMPORTANT:"
)

print(
    "The independent unseen priority test "
    "dataset was NOT read or used while "
    "building Priority V3."
)