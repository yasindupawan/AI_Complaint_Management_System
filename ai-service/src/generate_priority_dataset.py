import pandas as pd
import random
from pathlib import Path

OUTPUT_PATH = Path(
    "../datasets/priority/priority_training_dataset.csv"
)

RANDOM_STATE = 42
TARGET_PER_PRIORITY = 1000

random.seed(RANDOM_STATE)

# =========================================================
# SCENARIOS
# =========================================================

LOW_SCENARIOS = [
    "A small crack has appeared on a side road",
    "One street light is dim but still working",
    "There is a minor leak from a public water pipe",
    "A small amount of litter is scattered near the bus stop",
    "The roadside drain needs routine cleaning",
    "There is an occasional unpleasant smell near the market",
    "A curb has a small damaged section",
    "One lamp flickers occasionally at night",
    "A small puddle forms after light rain",
    "A few garbage bags have been left near the collection point",
]

MEDIUM_SCENARIOS = [
    "Several potholes are affecting vehicles on the main road",
    "Water supply has been unavailable for two days",
    "The roadside drain is blocked and water is collecting",
    "Garbage has not been collected for several days",
    "Several street lights are not working",
    "Smoke from a nearby workshop is affecting residents",
    "A water pipe leak is wasting a large amount of water",
    "The road surface is badly damaged in several places",
    "Wastewater is overflowing onto the roadside",
    "Repeated power interruptions are affecting many houses",
]

HIGH_SCENARIOS = [
    "A live electrical wire has fallen across the road",
    "A large sinkhole has opened near the school",
    "A major water pipe has burst and is flooding nearby houses",
    "Sewage is overflowing into several homes",
    "A damaged electrical pole may collapse onto the road",
    "Heavy toxic smoke is affecting residents",
    "A road section has collapsed and is creating an immediate accident risk",
    "Exposed electrical wiring is sparking near pedestrians",
    "Severe flooding is entering houses in the neighbourhood",
    "A chemical spill has occurred near a residential area",
]

LOCATIONS = [
    "near the school",
    "near the public market",
    "on the main road",
    "near our houses",
    "close to the bus stop",
    "near the hospital",
    "at the main junction",
    "in our neighbourhood",
    "along the roadside",
    "near the town centre",
]

LOW_ENDINGS = [
    "Please inspect it when possible.",
    "This appears to need routine maintenance.",
    "The issue is minor but should be checked.",
    "Residents are requesting maintenance.",
    "Please arrange a normal inspection.",
]

MEDIUM_ENDINGS = [
    "Please take action soon.",
    "The issue is affecting several residents.",
    "This problem has continued for some time.",
    "Residents are requesting prompt attention.",
    "Please arrange repairs as soon as possible.",
]

HIGH_ENDINGS = [
    "Immediate action is required.",
    "This is creating a serious safety risk.",
    "Please send an emergency response team.",
    "Residents may be in danger if this is not addressed immediately.",
    "Urgent intervention is required.",
]


def generate_records(
    scenarios,
    locations,
    endings,
    priority,
    target
):
    records = set()
    attempts = 0
    max_attempts = target * 100

    while len(records) < target and attempts < max_attempts:
        attempts += 1

        scenario = random.choice(scenarios)
        location = random.choice(locations)
        ending = random.choice(endings)

        variations = [
            f"{scenario} {location}. {ending}",
            f"Residents have reported that {scenario.lower()} {location}. {ending}",
            f"Please investigate because {scenario.lower()} {location}. {ending}",
            f"We are experiencing a problem where {scenario.lower()} {location}. {ending}",
            f"There is an issue: {scenario.lower()} {location}. {ending}",
        ]

        text = random.choice(variations)

        records.add(text)

    return [
        {
            "complaint_text": text,
            "priority": priority,
        }
        for text in records
    ]


print("=" * 70)
print("GENERATING PRIORITY TRAINING DATASET")
print("=" * 70)

records = []

records.extend(
    generate_records(
        LOW_SCENARIOS,
        LOCATIONS,
        LOW_ENDINGS,
        "low",
        TARGET_PER_PRIORITY,
    )
)

records.extend(
    generate_records(
        MEDIUM_SCENARIOS,
        LOCATIONS,
        MEDIUM_ENDINGS,
        "medium",
        TARGET_PER_PRIORITY,
    )
)

records.extend(
    generate_records(
        HIGH_SCENARIOS,
        LOCATIONS,
        HIGH_ENDINGS,
        "high",
        TARGET_PER_PRIORITY,
    )
)

df = pd.DataFrame(records)

# Remove duplicate texts
df = df.drop_duplicates(
    subset=["complaint_text"]
)

# Remove texts appearing under more than one priority
priority_counts = (
    df.groupby("complaint_text")["priority"]
    .nunique()
)

ambiguous_texts = priority_counts[
    priority_counts > 1
].index

df = df[
    ~df["complaint_text"].isin(
        ambiguous_texts
    )
].copy()

# Rebalance
balanced_frames = []

for priority in [
    "low",
    "medium",
    "high",
]:
    priority_df = df[
        df["priority"] == priority
    ].copy()

    if len(priority_df) < TARGET_PER_PRIORITY:
        raise ValueError(
            f"Not enough unique records for {priority}: "
            f"{len(priority_df)}"
        )

    priority_df = priority_df.sample(
        n=TARGET_PER_PRIORITY,
        random_state=RANDOM_STATE,
    )

    balanced_frames.append(
        priority_df
    )

df = pd.concat(
    balanced_frames,
    ignore_index=True,
)

df = df.sample(
    frac=1,
    random_state=RANDOM_STATE,
).reset_index(drop=True)

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8",
)

print("\n" + "=" * 70)
print("PRIORITY TRAINING DATASET CREATED")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_PATH}")

print(
    f"\nDataset Shape: {df.shape}"
)

print("\nPriority Distribution:")
print(
    df["priority"]
    .value_counts()
    .sort_index()
)

print(
    "\nDuplicate Complaint Texts:",
    df["complaint_text"]
    .duplicated()
    .sum()
)

print(
    "Unique Complaint Texts:",
    df["complaint_text"]
    .nunique()
)

print("\nSample:")
print(
    df[
        ["complaint_text", "priority"]
    ]
    .head(15)
    .to_string(index=False)
)