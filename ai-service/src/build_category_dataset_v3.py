import random
import re
from pathlib import Path

import pandas as pd


# =========================================================
# CONFIGURATION
# =========================================================

RANDOM_STATE = 42

random.seed(RANDOM_STATE)

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
DATASET_DIR = AI_SERVICE_DIR / "datasets"

INPUT_DATASET = (
    DATASET_DIR
    / "final_complaint_training_dataset_v2.csv"
)

OUTPUT_DATASET = (
    DATASET_DIR
    / "final_complaint_training_dataset_v3.csv"
)

AUGMENTED_RECORDS_PER_CATEGORY = 500


# =========================================================
# CATEGORY DEFINITIONS
# =========================================================

CATEGORY_CONFIG = {
    "roads": {
        "issues": [
            "there is a large pothole",
            "the road surface is badly damaged",
            "the street has several deep cracks",
            "a section of the road has sunk",
            "the road has become extremely uneven",
            "the asphalt surface is breaking apart",
            "the roadside curb is badly damaged",
            "there is a dangerous hole in the street",
            "the recently repaired road is damaged again",
            "loose stones are covering part of the road",
            "the road surface has deteriorated",
            "a section of the street needs resurfacing",
            "there is a broken curb beside the road",
            "the road has developed a large cave-in",
            "vehicles are struggling because of the rough road",
        ],
        "effects": [
            "vehicles are having difficulty passing safely",
            "drivers have to suddenly avoid the damaged area",
            "motorcyclists could easily lose control",
            "the damage is creating a risk for road users",
            "traffic is slowing down around the damaged section",
            "residents are concerned about possible accidents",
            "the damaged surface is becoming worse every day",
            "the road is difficult to use safely at night",
        ],
    },

    "garbage": {
        "issues": [
            "a large pile of garbage has accumulated",
            "household waste has been dumped illegally",
            "rubbish has not been collected for several days",
            "several bags of garbage are lying in the open",
            "the public garbage bin is overflowing",
            "waste has been dumped beside the public walkway",
            "a large amount of rubbish is scattered around",
            "uncollected garbage is piling up",
            "people are dumping household waste in this area",
            "rotting garbage has accumulated",
            "discarded waste is blocking part of the walkway",
            "plastic and household rubbish have been dumped",
            "the garbage collection has been missed repeatedly",
            "there is an abandoned pile of waste",
            "trash is spreading across the public area",
        ],
        "effects": [
            "the area has become very dirty and unpleasant",
            "a strong bad smell is spreading nearby",
            "flies and stray animals are gathering around the waste",
            "residents are worried about hygiene problems",
            "the waste is creating an unhealthy environment",
            "children and pedestrians have to pass close to the rubbish",
            "the garbage is spreading onto the surrounding area",
            "the situation is becoming worse every day",
        ],
    },

    "water_supply": {
        "issues": [
            "there has been no water supply since this morning",
            "several houses are not receiving water",
            "the water pressure is extremely low",
            "a water pipe appears to have burst",
            "clean water is leaking continuously from a pipe",
            "the drinking water has become discoloured",
            "the supplied water has an unusual taste",
            "the supplied water has a strange smell",
            "the main water line appears to be leaking",
            "water service has been interrupted",
            "only a very small amount of water is reaching the houses",
            "the local water supply keeps stopping",
            "there is a major leak in the water line",
            "the drinking water looks cloudy",
            "the neighbourhood has had no running water",
        ],
        "effects": [
            "residents cannot complete their daily household work",
            "families are struggling without a reliable water supply",
            "the problem is affecting several nearby homes",
            "a large amount of clean water is being wasted",
            "people are concerned about the quality of the drinking water",
            "residents need the water service restored",
            "the interruption has continued for several hours",
            "the issue is causing serious inconvenience to households",
        ],
    },

    "electricity": {
        "issues": [
            "there has been a power outage",
            "several houses have no electricity",
            "an electrical wire is hanging dangerously low",
            "a live electrical cable appears to be exposed",
            "a utility pole is leaning towards the road",
            "the street light is not working",
            "several street lamps are completely dark",
            "the electricity supply keeps cutting out",
            "the power supply is unstable",
            "an electrical box has been left open",
            "sparks are coming from an electrical connection",
            "an electric pole appears to be damaged",
            "the street lighting has stopped working",
            "residents are experiencing repeated power failures",
            "an exposed electrical cable is close to the public walkway",
        ],
        "effects": [
            "the area becomes completely dark at night",
            "residents are worried about electrical safety",
            "pedestrians may be at risk",
            "the problem is affecting several nearby households",
            "people are concerned that someone could receive an electric shock",
            "the electrical fault needs to be inspected",
            "the outage is disrupting normal daily activities",
            "the damaged equipment could become dangerous",
        ],
    },

    "drainage": {
        "issues": [
            "the roadside drain is completely blocked",
            "the drainage channel is clogged",
            "a manhole is overflowing",
            "rainwater cannot flow through the drain",
            "the culvert appears to be blocked",
            "dirty water is overflowing from the drain",
            "the storm drain is not clearing rainwater",
            "wastewater is backing up from the drainage system",
            "the drain is filled with mud and debris",
            "water is collecting because the drainage outlet is blocked",
            "the drainage system is overflowing during rainfall",
            "a roadside gutter is completely obstructed",
            "stagnant dirty water is collecting in the drain",
            "the drainage outlet is not functioning",
            "floodwater is building up because the drain is blocked",
        ],
        "effects": [
            "rainwater is spreading across the road",
            "dirty water is collecting around nearby houses",
            "the area floods whenever it rains",
            "pedestrians cannot use the walkway properly",
            "stagnant water is remaining for several days",
            "the overflow is creating an unsanitary condition",
            "water is entering nearby properties",
            "residents are worried about repeated flooding",
        ],
    },

    "environment": {
        "issues": [
            "thick smoke is spreading through the neighbourhood",
            "a strong chemical smell is coming from a nearby property",
            "large amounts of dust are affecting the surrounding area",
            "an oil spill has contaminated the roadside",
            "there is a strong unpleasant industrial odour",
            "chemical fumes are spreading through the area",
            "residents have noticed unusual smoke",
            "a nearby activity is causing severe air pollution",
            "there is an unknown chemical odour in the neighbourhood",
            "large numbers of mosquitoes are affecting residents",
            "wastewater appears to be polluting the surrounding land",
            "an oily substance has been released onto the ground",
            "heavy smoke is affecting nearby houses",
            "construction dust is spreading across the neighbourhood",
            "a suspected chemical spill has occurred",
        ],
        "effects": [
            "residents are concerned about possible health effects",
            "the air is becoming difficult to breathe",
            "the pollution is affecting nearby homes",
            "people are worried about environmental contamination",
            "the smell is affecting residents throughout the area",
            "children and elderly residents are being exposed",
            "the problem is affecting the surrounding environment",
            "residents are requesting an environmental inspection",
        ],
    },
}


# =========================================================
# COMMON LOCATIONS
#
# IMPORTANT:
# Same locations are deliberately shared across categories.
# This reduces location-based shortcuts such as:
# "school" -> roads
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
# NATURAL REQUEST ENDINGS
# =========================================================

REQUESTS = [
    "Please investigate this problem.",
    "Please take the necessary action.",
    "Residents are requesting assistance.",
    "Please arrange an inspection.",
    "Please resolve this issue as soon as possible.",
    "The responsible department should inspect the area.",
    "Please send the appropriate team to inspect this problem.",
    "We would appreciate prompt assistance.",
    "Please address this issue.",
    "Residents would like this problem resolved.",
    "",
]


# =========================================================
# SHORT COMPLAINT TEMPLATES
# =========================================================

SHORT_TEMPLATES = [
    "{issue} {location}.",
    "{issue} {location}. {request}",
    "{location}, {issue}.",
    "Residents report that {issue} {location}.",
    "We would like to report that {issue} {location}.",
]


# =========================================================
# LONGER NATURAL TEMPLATES
# =========================================================

LONG_TEMPLATES = [
    "{issue} {location}. {effect}. {request}",

    "Residents have reported that {issue} {location}. "
    "{effect}. {request}",

    "We are experiencing a problem where {issue} {location}. "
    "{effect}. {request}",

    "People living nearby have noticed that {issue} {location}. "
    "{effect}. {request}",

    "There is a public complaint because {issue} {location}. "
    "{effect}. {request}",

    "{location}, {issue}. "
    "{effect}. {request}",

    "The community would like to report that {issue} {location}. "
    "{effect}. {request}",
]


# =========================================================
# CLEAN TEXT
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
# NORMALIZE FOR DUPLICATE CHECKING
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
# GENERATE CATEGORY EXAMPLES
# =========================================================

def generate_category_examples(
    category,
    number_of_examples,
):
    config = CATEGORY_CONFIG[category]

    generated_examples = set()

    maximum_attempts = (
        number_of_examples * 100
    )

    attempts = 0

    while (
        len(generated_examples)
        < number_of_examples
        and
        attempts < maximum_attempts
    ):
        attempts += 1

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

        # Mix short and longer natural complaints
        if random.random() < 0.35:
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

        complaint = clean_text(
            complaint
        )

        if len(complaint.split()) < 5:
            continue

        generated_examples.add(
            complaint
        )

    if (
        len(generated_examples)
        < number_of_examples
    ):
        raise RuntimeError(
            f"Unable to generate enough unique "
            f"examples for category '{category}'. "
            f"Generated "
            f"{len(generated_examples)} / "
            f"{number_of_examples}."
        )

    return list(
        generated_examples
    )


# =========================================================
# LOAD V2 DATASET
# =========================================================

print("=" * 75)
print("BUILD CATEGORY DATASET V3")
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
    "category",
}

missing_columns = (
    required_columns
    - set(v2_df.columns)
)

if missing_columns:
    raise ValueError(
        f"Missing required columns: "
        f"{sorted(missing_columns)}"
    )

v2_df = (
    v2_df[
        [
            "complaint_text",
            "category",
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

v2_df["category"] = (
    v2_df["category"]
    .astype(str)
    .str.strip()
)

print(
    f"\nV2 Dataset Shape: "
    f"{v2_df.shape}"
)

print(
    "\nV2 Category Distribution:"
)

print(
    v2_df["category"]
    .value_counts()
    .sort_index()
)


# =========================================================
# GENERATE AUGMENTATION DATA
# =========================================================

augmentation_records = []

print("\n" + "=" * 75)
print("GENERATING NATURAL HARD EXAMPLES")
print("=" * 75)

for category in CATEGORY_CONFIG:
    examples = (
        generate_category_examples(
            category,
            AUGMENTED_RECORDS_PER_CATEGORY,
        )
    )

    for complaint_text in examples:
        augmentation_records.append(
            {
                "complaint_text":
                    complaint_text,

                "category":
                    category,

                "source":
                    "v3_natural_augmentation",
            }
        )

    print(
        f"{category:15} : "
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

v2_df["source"] = "v2_original"


# =========================================================
# COMBINE V2 + AUGMENTATION
# =========================================================

combined_df = pd.concat(
    [
        v2_df,
        augmentation_df,
    ],
    ignore_index=True,
)


# =========================================================
# REMOVE NORMALIZED DUPLICATES
# =========================================================

combined_df["normalized_text"] = (
    combined_df["complaint_text"]
    .map(normalize_text)
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
# CHECK LABEL CONFLICTS
# =========================================================

label_counts = (
    combined_df
    .groupby(
        "normalized_text"
    )["category"]
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
        "Conflicting labels detected."
    )

    conflicts = combined_df[
        combined_df[
            "normalized_text"
        ].isin(
            conflicting_texts
        )
    ]

    print(
        conflicts[
            [
                "complaint_text",
                "category",
                "source",
            ]
        ]
        .head(20)
        .to_string(index=False)
    )

    raise ValueError(
        "Dataset contains category conflicts."
    )


# =========================================================
# REMOVE HELPER COLUMN
# =========================================================

combined_df = combined_df.drop(
    columns=[
        "normalized_text",
    ]
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
print("V3 DATASET QUALITY CHECK")
print("=" * 75)

print(
    f"\nOriginal V2 Records : "
    f"{len(v2_df)}"
)

print(
    f"Augmented Records   : "
    f"{len(augmentation_df)}"
)

print(
    f"Duplicates Removed  : "
    f"{removed_duplicates}"
)

print(
    f"Final V3 Shape      : "
    f"{combined_df.shape}"
)

print(
    "\nFinal Category Distribution:"
)

category_distribution = (
    combined_df["category"]
    .value_counts()
    .sort_index()
)

print(
    category_distribution
)


# =========================================================
# VERIFY CATEGORY BALANCE
# =========================================================

minimum_category_size = (
    category_distribution.min()
)

maximum_category_size = (
    category_distribution.max()
)

if (
    minimum_category_size
    != maximum_category_size
):
    print(
        "\nWARNING: "
        "Final category counts are not perfectly balanced."
    )

else:
    print(
        "\nCategory balance: PERFECT"
    )


# =========================================================
# SOURCE DISTRIBUTION
# =========================================================

print(
    "\nSource Distribution:"
)

print(
    combined_df["source"]
    .value_counts()
)


# =========================================================
# SAMPLE AUGMENTED RECORDS
# =========================================================

print("\n" + "=" * 75)
print("SAMPLE V3 NATURAL EXAMPLES")
print("=" * 75)

for category in sorted(
    CATEGORY_CONFIG.keys()
):
    print(
        f"\n--- {category.upper()} ---"
    )

    category_samples = (
        combined_df[
            (
                combined_df["category"]
                == category
            )
            &
            (
                combined_df["source"]
                == "v3_natural_augmentation"
            )
        ]
        .sample(
            n=5,
            random_state=RANDOM_STATE,
        )
    )

    for number, text in enumerate(
        category_samples[
            "complaint_text"
        ],
        start=1,
    ):
        print(
            f"{number:02}. {text}"
        )


# =========================================================
# SAVE V3 DATASET
# =========================================================

combined_df.to_csv(
    OUTPUT_DATASET,
    index=False,
)

print("\n" + "=" * 75)
print("V3 DATASET SAVED SUCCESSFULLY")
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
    "\nIMPORTANT:"
    "\nThe independent manual unseen test dataset "
    "was NOT used while generating V3."
)