import pandas as pd
import random
from pathlib import Path

OUTPUT_PATH = Path(
    "../datasets/priority/priority_training_dataset_v2.csv"
)

RANDOM_STATE = 42
TARGET_PER_PRIORITY = 1000

random.seed(RANDOM_STATE)

# =========================================================
# PRIORITY SCENARIOS
# =========================================================

LOW_SCENARIOS = [
    "One street lamp is dim but still provides some light",
    "A small crack has appeared along the edge of a side road",
    "A minor water leak is dripping from a public pipe",
    "A small amount of litter is scattered near a bus stop",
    "A roadside drain has some leaves and sediment inside it",
    "A curb has a small chipped section",
    "One lamp flickers occasionally during the evening",
    "A shallow puddle forms after light rain",
    "A few garbage bags are waiting at the normal collection point",
    "A small patch of the road surface has become uneven",
    "Tap water has a slight unusual smell but remains available",
    "A drain cover is slightly loose but still in place",
    "A single street sign area has minor surface damage",
    "There is a small amount of dust near a construction site",
    "A public bin is partly full but not overflowing",
]

MEDIUM_SCENARIOS = [
    "Several potholes are making vehicles slow down on the main road",
    "Water supply has been unavailable to a neighbourhood since yesterday",
    "A roadside drain is blocked and rainwater is collecting across part of the road",
    "Garbage collection has been missed for several days and waste is accumulating",
    "Several street lights along one road are not working",
    "Smoke from a nearby workshop is entering nearby houses",
    "A water pipe is leaking continuously and a large amount of water is being wasted",
    "The road surface is damaged in several places and motorcycles are having difficulty passing",
    "Wastewater is overflowing from a drain onto the roadside",
    "Repeated electricity interruptions are affecting many houses",
    "A large public waste bin is overflowing onto the pavement",
    "A section of road has sunk and vehicles must drive around it",
    "A sewer blockage is creating a strong smell across several nearby properties",
    "Water pressure is too low for many houses in the area",
    "Construction dust is affecting nearby shops and homes throughout the day",
]

HIGH_SCENARIOS = [
    "An exposed electrical cable is hanging low where pedestrians can reach it",
    "A large section of road has collapsed beside a school entrance",
    "A major water pipe has burst and water is entering nearby houses",
    "Sewage is flowing into several homes from an overflowing manhole",
    "A damaged electrical pole is leaning over a busy road",
    "Dense smoke from a nearby facility is causing residents to leave their homes",
    "A deep hole has opened across most of the traffic lane near a blind bend",
    "Electrical wires are sparking beside a crowded pedestrian area",
    "Floodwater has entered houses and is continuing to rise",
    "A chemical liquid has leaked onto a public road beside residential buildings",
    "A fallen power cable is lying across a pedestrian path",
    "Part of a roadside retaining wall has collapsed onto the traffic lane",
    "A water main failure has flooded the entrance to a hospital",
    "Sewage is spreading across a school access road",
    "Thick smoke is causing breathing difficulty among nearby residents",
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
    "close to the playground",
    "near the community hall",
]

CONTEXTS = [
    "Residents noticed the problem this morning.",
    "The condition has remained unchanged since yesterday.",
    "People in the area have reported the same issue.",
    "The problem can be seen clearly from the roadside.",
    "The issue is affecting normal use of the area.",
    "Several nearby residents have raised concerns.",
    "The condition becomes worse during busy periods.",
    "The problem has continued despite recent rainfall.",
    "People passing through the area are being affected.",
    "The issue has been reported by households nearby.",
]

OPENERS = [
    "{scenario} {location}.",
    "Residents have noticed that {scenario_lower} {location}.",
    "There is a problem where {scenario_lower} {location}.",
    "People in the area are reporting that {scenario_lower} {location}.",
    "We have noticed that {scenario_lower} {location}.",
    "A local issue has developed where {scenario_lower} {location}.",
    "The situation involves {scenario_lower} {location}.",
]

# =========================================================
# GENERATION FUNCTION
# =========================================================

def generate_records(
    scenarios,
    priority,
    target
):
    records = set()
    attempts = 0
    max_attempts = target * 200

    while len(records) < target and attempts < max_attempts:
        attempts += 1

        scenario = random.choice(scenarios)
        location = random.choice(LOCATIONS)
        opener = random.choice(OPENERS)

        sentence = opener.format(
            scenario=scenario,
            scenario_lower=scenario[0].lower() + scenario[1:],
            location=location,
        )

        if random.random() < 0.55:
            sentence += " " + random.choice(CONTEXTS)

        sentence = " ".join(sentence.split())

        records.add(sentence)

    if len(records) < target:
        raise ValueError(
            f"Could only generate {len(records)} unique "
            f"records for {priority}"
        )

    return [
        {
            "complaint_text": text,
            "priority": priority,
        }
        for text in records
    ]

# =========================================================
# BUILD DATASET
# =========================================================

print("=" * 70)
print("GENERATING PRIORITY TRAINING DATASET V2")
print("=" * 70)

records = []

records.extend(
    generate_records(
        LOW_SCENARIOS,
        "low",
        TARGET_PER_PRIORITY,
    )
)

records.extend(
    generate_records(
        MEDIUM_SCENARIOS,
        "medium",
        TARGET_PER_PRIORITY,
    )
)

records.extend(
    generate_records(
        HIGH_SCENARIOS,
        "high",
        TARGET_PER_PRIORITY,
    )
)

df = pd.DataFrame(records)

# =========================================================
# QUALITY CHECKS
# =========================================================

df = df.drop_duplicates(
    subset=["complaint_text"]
)

priority_per_text = (
    df.groupby("complaint_text")["priority"]
    .nunique()
)

ambiguous_texts = priority_per_text[
    priority_per_text > 1
].index

df = df[
    ~df["complaint_text"].isin(
        ambiguous_texts
    )
].copy()

# =========================================================
# REBALANCE
# =========================================================

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
            f"Not enough records for {priority}: "
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

# =========================================================
# SAVE
# =========================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8",
)

# =========================================================
# REPORT
# =========================================================

print("\n" + "=" * 70)
print("PRIORITY TRAINING DATASET V2 CREATED")
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