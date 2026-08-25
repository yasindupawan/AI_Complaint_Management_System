import random
import re
from pathlib import Path

import pandas as pd


# =========================================================
# CONFIGURATION
# =========================================================

RANDOM_STATE = 42
EXPECTED_PER_CLASS = 50
EXPECTED_TOTAL = 150

random.seed(RANDOM_STATE)

CURRENT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = CURRENT_DIR.parent

PRIORITY_DATA_DIR = (
    AI_SERVICE_DIR
    / "datasets"
    / "priority"
)

TRAIN_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v3.csv"
)

DEVELOPMENT_TEST_DATASET = (
    PRIORITY_DATA_DIR
    / "manual_unseen_priority_test_dataset.csv"
)

OUTPUT_DATASET = (
    PRIORITY_DATA_DIR
    / "final_blind_priority_test_dataset.csv"
)


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def clean_text(text):
    text = str(text).strip()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text


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
# FINAL BLIND TEST COMPLAINTS
#
# These examples are independently authored for this final
# evaluation and are not generated using the V3 augmentation
# templates.
# =========================================================


# =========================================================
# LOW PRIORITY - 50
# =========================================================

LOW_COMPLAINTS = [
    "The street name board at the end of our lane is faded but the words can still be read.",
    "A small amount of water is dripping from the tap at the public washing area.",
    "One paving stone near the community library is slightly raised.",
    "A waste bin beside the footpath has a cracked handle but remains usable.",
    "The lamp outside one house flickers for a few seconds before becoming steady.",
    "A narrow crack has appeared beside the edge of a lightly used access road.",
    "A few dry leaves have collected around the opening of the roadside gutter.",
    "There is a small patch of loose gravel beside the entrance to our lane.",
    "The public water tap is running more slowly than it normally does.",
    "A small puddle remains beside the pavement for a while after light rain.",
    "The paint on a pedestrian crossing sign has started to fade.",
    "A few food wrappers have been left near a bench in the park.",
    "One section of the pavement feels slightly uneven when walking over it.",
    "The cover of a public rubbish container does not close properly.",
    "There is a minor chip on the concrete curb beside our street.",
    "One streetlight takes longer than the others to switch on at night.",
    "A small trickle of water can be seen coming from a joint in a roadside pipe.",
    "The drain beside one property has a thin layer of leaves inside it.",
    "A small piece of the road shoulder has worn away near the corner.",
    "There are several empty bottles lying beside a public seating area.",
    "The water from one public tap has slightly weaker pressure than before.",
    "A small section of pavement has developed a surface crack.",
    "One public bin has a loose lid although rubbish can still be placed inside.",
    "A street sign is leaning slightly but is still clearly visible to drivers.",
    "A shallow depression has appeared on a quiet residential lane.",
    "Some litter has collected around the base of a public notice board.",
    "A drain cover rattles slightly whenever a vehicle passes over it.",
    "There is a minor leak around the connection of an outdoor water tap.",
    "One lamp along the side street is less bright than the lamps around it.",
    "A few weeds are growing through cracks beside the roadside drain.",
    "The surface near the edge of the road is slightly rough in one small area.",
    "A small quantity of rubbish is lying next to an otherwise empty public bin.",
    "The water pressure in a single household has become a little weaker this morning.",
    "A short section of the footpath has a small crack running through it.",
    "One drainage grate appears slightly loose but water is flowing normally.",
    "There is a small amount of mud beside the road after yesterday's rain.",
    "A public lamp occasionally switches off for a moment and then comes back on.",
    "The corner of a concrete pavement slab has broken away slightly.",
    "A few pieces of paper are scattered beside the entrance to the playground.",
    "One road marker has become faded but can still be seen during daylight.",
    "A small damp patch is visible around a public water pipe connection.",
    "The roadside gutter contains a little sand but is not blocked.",
    "A public waste bin has a dent on one side but can still hold rubbish.",
    "The edge of a side road has developed a small shallow hole.",
    "One street lamp gives slightly weaker light than the nearby lamps.",
    "A few plastic cups have been left beside the public walkway.",
    "There is a small crack in the pavement outside the community building.",
    "The public tap near the field has a slow drip after it is turned off.",
    "A small amount of sediment has collected at the bottom of the roadside channel.",
    "One signpost beside the road is slightly tilted but remains secure.",
]


# =========================================================
# MEDIUM PRIORITY - 50
# =========================================================

MEDIUM_COMPLAINTS = [
    "Rubbish collection has not taken place for several days and bags are building up along our street.",
    "Several lamps on the road to the housing area remain off every night.",
    "Residents in a group of houses have had very weak water pressure since yesterday.",
    "A number of potholes are forcing vehicles to move around damaged sections of the road.",
    "The roadside drainage line is clogged and rainwater spreads across one side of the street.",
    "Waste has accumulated around the public collection point and is causing a strong smell.",
    "Electricity has been cutting out repeatedly in our neighbourhood during the evenings.",
    "A water pipe beside the road has been leaking continuously since yesterday.",
    "The road surface near the shopping area is badly broken and traffic has to slow down.",
    "Dirty water from a blocked drainage channel is spreading onto the pedestrian path.",
    "Several households have been without their normal water supply since yesterday morning.",
    "A row of public lights near the residential area has stopped working.",
    "Garbage has remained beside the collection area for days and is attracting flies.",
    "The access road has several damaged patches that make normal driving difficult.",
    "Water from a leaking main is running along the roadside and being wasted continuously.",
    "A drainage blockage causes water to cover part of the road whenever there is ordinary rainfall.",
    "Smoke from a workshop regularly enters neighbouring properties and causes discomfort.",
    "A section of the local road has become uneven enough that drivers have to reduce speed significantly.",
    "The sewer near several houses appears blocked and an unpleasant smell has persisted for two days.",
    "Residents are facing repeated interruptions to the water service throughout the day.",
    "Several public rubbish containers are full and additional waste is being placed around them.",
    "A group of streetlights near the junction has been out for the last two nights.",
    "A damaged portion of the road is causing vehicles to move into the opposite side to pass it.",
    "The drain beside the residential road cannot clear rainwater properly and water remains for hours.",
    "A pipe leak is sending a steady flow of clean water into the roadside gutter.",
    "Households in this area are experiencing frequent electricity interruptions every evening.",
    "Uncollected rubbish is spreading from the collection point onto the nearby pavement.",
    "Several potholes along the bus route are causing noticeable delays to vehicles.",
    "Wastewater from a partially blocked drain is reaching the entrances of nearby properties.",
    "Water pressure has dropped significantly across a number of homes in the neighbourhood.",
    "The surface of the road near the community building has deteriorated across a wide section.",
    "A large amount of rubbish has accumulated at the usual pickup location after missed collections.",
    "Multiple lights along the pedestrian route are not operating after dark.",
    "A roadside pipe has been losing water steadily for more than a day.",
    "The drainage channel beside the market is blocked enough to leave standing dirty water.",
    "Residents have reported repeated power failures lasting short periods throughout the evening.",
    "Several sections of the local street are damaged and motorists are having difficulty using the road normally.",
    "The public waste collection point has become overloaded and rubbish is spreading around the area.",
    "A number of houses have had no running water for most of the day.",
    "Rainwater is unable to drain from one section of the street because the outlet is clogged.",
    "The road leading into the neighbourhood has extensive cracking and several rough sections.",
    "A sewer problem is causing wastewater and bad odours around several nearby properties.",
    "The water service has been stopping for hours at a time across the residential area.",
    "Several street lamps around the public transport area are completely dark at night.",
    "Garbage bags have accumulated along the roadside following repeated delays in collection.",
    "A large leak from a public pipe has been wasting water continuously but has not flooded any homes.",
    "The road near the local shops has multiple holes and vehicles are regularly swerving around them.",
    "A blocked roadside channel is causing water to remain across part of the vehicle lane.",
    "Smoke from a nearby commercial site has repeatedly affected several homes during the past few days.",
    "A damaged stretch of road is slowing normal traffic and residents have requested repairs.",
]


# =========================================================
# HIGH PRIORITY - 50
# =========================================================

HIGH_COMPLAINTS = [
    "A fallen electricity cable is lying across the entrance used by pedestrians.",
    "Floodwater is entering several homes and the water level is still increasing.",
    "Electrical wires are sparking beside a busy pedestrian crossing.",
    "A utility pole carrying power lines is leaning dangerously toward the roadway.",
    "Strong chemical fumes are spreading into nearby houses and residents are having difficulty breathing.",
    "A deep collapse in the road has opened across most of the lane used by vehicles.",
    "Sewage is flowing directly into occupied houses from an overflowing system.",
    "A live cable has fallen onto the pavement where people are walking.",
    "A large tree has collapsed onto electrical wires above a public road.",
    "Heavy smoke is filling homes and several residents are struggling to breathe.",
    "Rapidly rising floodwater has surrounded houses and people are unable to leave safely.",
    "An electrical cabinet is open with exposed live parts within reach of the public.",
    "A damaged power pole appears close to falling onto passing traffic.",
    "A large chemical spill is spreading along the road beside residential properties.",
    "Part of a retaining structure has collapsed into a lane carrying moving traffic.",
    "A hanging electrical wire is low enough for pedestrians to touch.",
    "Floodwater has reached inside occupied homes and continues to rise quickly.",
    "A broken electrical line is producing sparks beside the entrance to a crowded area.",
    "Dense black smoke is entering houses and causing serious breathing problems.",
    "A major section of roadway has collapsed and approaching drivers may not see the danger in time.",
    "An exposed high-voltage line is lying close to a public footpath.",
    "Chemical liquid is leaking across an area used by residents and producing powerful fumes.",
    "A damaged electrical pole is hanging over a road used by buses and cars.",
    "A large hole has opened suddenly across the driving lane and vehicles are approaching it at speed.",
    "Overflowing sewage has entered several homes and residents cannot safely remain inside.",
    "A power cable has fallen across the road and vehicles are passing close to it.",
    "Floodwater is flowing rapidly through the neighbourhood and entering ground-floor properties.",
    "A strong chemical odour is affecting residents after an unknown liquid spilled near their houses.",
    "Live electrical components are exposed inside a damaged roadside power box.",
    "A roadside wall has collapsed and debris is blocking a major part of the traffic lane.",
    "Residents are trapped inside houses because floodwater around the buildings is rising rapidly.",
    "A fallen lamp pole has electrical wiring attached and is blocking part of the roadway.",
    "Thick smoke from a nearby building is spreading through neighbouring homes and affecting breathing.",
    "A high-voltage wire is hanging at head height beside a route used by pedestrians.",
    "A major road collapse has created a dangerous drop directly in the path of traffic.",
    "A chemical substance has leaked beside homes and people nearby are reporting breathing difficulties.",
    "Sewage is pouring from an overflowing chamber into several occupied properties.",
    "An electricity pole damaged at its base is leaning toward a crowded roadside area.",
    "Flooding has cut off the safe exit from several houses while the water continues to increase.",
    "Electrical cables are sparking on the ground close to people waiting beside the road.",
    "A large section of a roadside structure has fallen into moving traffic.",
    "Toxic-smelling fumes are spreading across a residential area after a chemical leak.",
    "A live power wire has fallen onto a walkway used by schoolchildren and other pedestrians.",
    "Water is rising rapidly inside several houses following severe flooding.",
    "A badly damaged electricity pole is at risk of falling across the main road.",
    "Dense smoke has entered nearby homes and occupants are reporting severe breathing difficulty.",
    "A deep road failure spans most of the vehicle lane and presents an immediate crash risk.",
    "An exposed electrical cable is touching a metal roadside barrier accessible to pedestrians.",
    "A chemical spill is spreading toward occupied houses and residents are being exposed to fumes.",
    "Fast-moving floodwater is entering residential buildings and people need a safe way out.",
]


# =========================================================
# VALIDATE MANUAL BANK
# =========================================================

print("=" * 75)
print("CREATE FINAL BLIND PRIORITY TEST DATASET")
print("=" * 75)

complaint_groups = {
    "low": LOW_COMPLAINTS,
    "medium": MEDIUM_COMPLAINTS,
    "high": HIGH_COMPLAINTS,
}


for priority, complaints in complaint_groups.items():

    if len(complaints) != EXPECTED_PER_CLASS:
        raise ValueError(
            f"{priority.upper()} must contain exactly "
            f"{EXPECTED_PER_CLASS} complaints. "
            f"Found: {len(complaints)}"
        )

    print(
        f"\n{priority.upper():6} complaints: "
        f"{len(complaints)}"
    )


# =========================================================
# BUILD DATAFRAME
# =========================================================

records = []

for priority, complaints in complaint_groups.items():

    for complaint in complaints:

        records.append(
            {
                "complaint_text":
                    clean_text(complaint),

                "priority":
                    priority,
            }
        )


blind_df = pd.DataFrame(
    records
)


# =========================================================
# BASIC QUALITY CHECK
# =========================================================

print("\n" + "=" * 75)
print("BASIC QUALITY CHECK")
print("=" * 75)

print(
    f"\nInitial Shape: "
    f"{blind_df.shape}"
)

if len(blind_df) != EXPECTED_TOTAL:
    raise ValueError(
        f"Expected {EXPECTED_TOTAL} records, "
        f"found {len(blind_df)}."
    )

if blind_df.isna().any().any():
    raise ValueError(
        "Missing values detected."
    )

empty_count = (
    blind_df[
        "complaint_text"
    ]
    .str.strip()
    .eq("")
    .sum()
)

print(
    f"Empty Complaint Texts: "
    f"{empty_count}"
)

if empty_count:
    raise ValueError(
        "Empty complaints detected."
    )


# =========================================================
# INTERNAL DUPLICATE CHECK
# =========================================================

blind_df[
    "_normalized"
] = (
    blind_df[
        "complaint_text"
    ]
    .map(
        normalize_text
    )
)

exact_duplicates = (
    blind_df[
        "complaint_text"
    ]
    .duplicated()
    .sum()
)

normalized_duplicates = (
    blind_df[
        "_normalized"
    ]
    .duplicated()
    .sum()
)

print(
    f"\nExact Internal Duplicates      : "
    f"{exact_duplicates}"
)

print(
    f"Normalized Internal Duplicates : "
    f"{normalized_duplicates}"
)

if (
    exact_duplicates > 0
    or normalized_duplicates > 0
):
    raise ValueError(
        "Duplicate complaints detected "
        "inside final blind dataset."
    )


# =========================================================
# LOAD PREVIOUS DATASETS FOR LEAKAGE CHECK ONLY
# =========================================================

reference_files = [
    (
        "V3 Training Dataset",
        TRAIN_DATASET,
    ),
    (
        "Development Test Dataset",
        DEVELOPMENT_TEST_DATASET,
    ),
]


print("\n" + "=" * 75)
print("REFERENCE DATASET LEAKAGE CHECK")
print("=" * 75)


blind_normalized = set(
    blind_df[
        "_normalized"
    ]
)


for (
    dataset_name,
    dataset_path,
) in reference_files:

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"{dataset_name} not found:\n"
            f"{dataset_path}"
        )

    reference_df = pd.read_csv(
        dataset_path
    )

    if (
        "complaint_text"
        not in reference_df.columns
    ):
        raise ValueError(
            f"{dataset_name} does not contain "
            f"'complaint_text'."
        )

    reference_text = (
        reference_df[
            "complaint_text"
        ]
        .dropna()
        .astype(str)
        .map(
            normalize_text
        )
    )

    reference_normalized = set(
        reference_text
    )

    overlap = (
        blind_normalized
        & reference_normalized
    )

    print(
        f"\n{dataset_name}:"
    )

    print(
        f"Normalized Exact Overlap: "
        f"{len(overlap)}"
    )

    if overlap:

        print(
            "\nOverlapping examples:"
        )

        for text in list(overlap)[:20]:
            print(
                f"- {text}"
            )

        raise ValueError(
            f"Leakage detected against "
            f"{dataset_name}."
        )

    print(
        "PASS: No normalized exact overlap."
    )


# =========================================================
# LABEL DISTRIBUTION
# =========================================================

print("\n" + "=" * 75)
print("FINAL CLASS DISTRIBUTION")
print("=" * 75)

distribution = (
    blind_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)

print(
    "\n"
    + distribution.to_string()
)

expected_distribution = {
    "low": 50,
    "medium": 50,
    "high": 50,
}

for (
    priority,
    expected_count,
) in expected_distribution.items():

    actual_count = int(
        distribution.get(
            priority,
            0,
        )
    )

    if actual_count != expected_count:
        raise ValueError(
            f"{priority} count incorrect. "
            f"Expected {expected_count}, "
            f"found {actual_count}."
        )


print(
    "\nPASS: Final blind dataset "
    "is perfectly balanced."
)


# =========================================================
# TEXT LENGTH CHECK
# =========================================================

blind_df[
    "_word_count"
] = (
    blind_df[
        "complaint_text"
    ]
    .str.split()
    .str.len()
)

print("\n" + "=" * 75)
print("TEXT LENGTH SUMMARY")
print("=" * 75)

length_summary = (
    blind_df
    .groupby(
        "priority"
    )[
        "_word_count"
    ]
    .agg(
        [
            "min",
            "mean",
            "median",
            "max",
        ]
    )
)

print(
    "\n"
    + length_summary.to_string(
        float_format=lambda value:
            f"{value:.2f}"
    )
)


# =========================================================
# RANDOM SAMPLE
# =========================================================

print("\n" + "=" * 75)
print("SAMPLE FINAL BLIND COMPLAINTS")
print("=" * 75)

for priority in [
    "low",
    "medium",
    "high",
]:

    print(
        f"\n--- {priority.upper()} ---"
    )

    sample = (
        blind_df[
            blind_df[
                "priority"
            ]
            == priority
        ]
        .sample(
            n=5,
            random_state=RANDOM_STATE,
        )
    )

    for (
        number,
        complaint,
    ) in enumerate(
        sample[
            "complaint_text"
        ],
        start=1,
    ):

        print(
            f"{number:02}. "
            f"{complaint}"
        )


# =========================================================
# REMOVE HELPER COLUMNS
# =========================================================

blind_df = (
    blind_df
    .drop(
        columns=[
            "_normalized",
            "_word_count",
        ]
    )
)


# =========================================================
# SHUFFLE
# =========================================================

blind_df = (
    blind_df
    .sample(
        frac=1,
        random_state=RANDOM_STATE,
    )
    .reset_index(
        drop=True
    )
)


# =========================================================
# SAVE
# =========================================================

blind_df.to_csv(
    OUTPUT_DATASET,
    index=False,
)


# =========================================================
# VERIFY SAVED FILE
# =========================================================

saved_df = pd.read_csv(
    OUTPUT_DATASET
)

if saved_df.shape != (
    EXPECTED_TOTAL,
    2,
):
    raise ValueError(
        "Saved dataset verification failed."
    )


# =========================================================
# FINAL OUTPUT
# =========================================================

print("\n" + "=" * 75)
print("FINAL BLIND PRIORITY TEST DATASET CREATED")
print("=" * 75)

print(
    f"\nOutput File:\n"
    f"{OUTPUT_DATASET}"
)

print(
    f"\nFinal Shape: "
    f"{saved_df.shape}"
)

print(
    "\nFinal Distribution:"
)

print(
    saved_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)

print(
    "\nPASS:"
)

print(
    "150 independently authored priority "
    "evaluation complaints were created."
)

print(
    "No normalized exact overlap was found "
    "against the V3 training dataset or "
    "the previous development test dataset."
)

print(
    "\nIMPORTANT:"
)

print(
    "Do not inspect model predictions and then "
    "modify this dataset or the V3 training data."
)

print(
    "The next evaluation should be treated as "
    "the final blind priority evaluation."
)