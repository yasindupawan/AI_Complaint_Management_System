import pandas as pd
from pathlib import Path

OUTPUT_PATH = Path(
    "../datasets/priority/manual_unseen_priority_test_dataset.csv"
)

records = []

# =========================================================
# LOW PRIORITY - 50
# =========================================================

low = [
    "One street lamp near the end of our lane is dim but still working.",
    "A small crack has appeared along the edge of a quiet residential road.",
    "There is a slight leak from a public tap near the market.",
    "A few pieces of litter are scattered beside the bus stop.",
    "Leaves have collected inside a roadside drain but water can still pass through it.",
    "A small section of the curb near our house is chipped.",
    "One lamp near the playground flickers for a few seconds at night.",
    "A shallow puddle forms beside the road after light rain.",
    "A public waste bin is partly full but there is still space inside it.",
    "A small patch of asphalt near the junction has become uneven.",
    "The tap water has a slight unusual smell but the supply is normal.",
    "A drain cover near the market is slightly loose but remains in place.",
    "There is a small amount of dust from construction near the roadside.",
    "One street light takes a long time to switch on in the evening.",
    "A few garbage bags are waiting at the normal collection point.",
    "A small pothole has started forming on a side road with little traffic.",
    "A minor drip is coming from a pipe connection near the community hall.",
    "The edge of the pavement near the school has a small crack.",
    "A street lamp is working but its light is weaker than the others.",
    "A little rubbish has accumulated beside a public bench.",
    "The roadside drain near our house contains some sand and leaves.",
    "A small road marking area has faded near the junction.",
    "One waste bin lid is damaged but the bin can still be used.",
    "A small amount of water collects near the curb after rain.",
    "The street surface near our gate has become slightly rough.",
    "One lamp post has a loose cover at the bottom but no wires are exposed.",
    "A public water tap is dripping slowly.",
    "There are a few plastic bottles beside the road near the market.",
    "A shallow crack runs across part of a side lane.",
    "The drain near the bus stop needs cleaning but is not overflowing.",
    "A small patch of the road has lost some surface material.",
    "One street lamp sometimes switches off for a short period.",
    "There is a faint smell from a drain near the market in the evening.",
    "A small pile of leaves has collected beside the drainage opening.",
    "The curb near the playground has a minor damaged corner.",
    "A public bin near the school is nearly full.",
    "There is a small water leak from a connection beside the road.",
    "A short section of pavement is uneven near our house.",
    "One light near the community hall appears slightly dim.",
    "A few pieces of paper and plastic are scattered around the bus stop.",
    "The drain grate near the junction makes a slight noise when vehicles pass.",
    "A small crack has appeared near the edge of the village road.",
    "The water pressure is slightly lower than usual in one house.",
    "A lamp near the market occasionally flickers during the night.",
    "There is a small amount of mud in the roadside drain.",
    "One public bin has a damaged handle.",
    "A small puddle remains near the curb for a short time after rain.",
    "The road edge near our lane is slightly worn.",
    "A small drip is coming from a public water meter connection.",
    "A street lamp near our house is still working but is not as bright as before."
]

records.extend(
    {"complaint_text": text, "priority": "low"}
    for text in low
)

assert len(low) == 50

# =========================================================
# MEDIUM PRIORITY - 50
# =========================================================

medium = [
    "Several potholes on the main road are forcing vehicles to slow down and change lanes.",
    "Our neighbourhood has had no water supply since yesterday morning.",
    "A roadside drain is blocked and rainwater is spreading across part of the road.",
    "Garbage has not been collected for four days and waste is building up outside houses.",
    "Several street lights along the main road have stopped working.",
    "Smoke from a nearby workshop is entering surrounding homes every evening.",
    "A public water pipe has been leaking continuously for two days.",
    "The road surface near the market is damaged in several places and motorcycles are struggling to pass.",
    "Wastewater is overflowing from a roadside drain onto the pavement.",
    "Electricity has been cutting off several times each day in our area.",
    "A large public waste bin is overflowing and rubbish is falling onto the walkway.",
    "A section of road near the junction has sunk and vehicles must drive around it.",
    "A sewer blockage is causing a strong smell across several nearby houses.",
    "Water pressure is too low for many homes in the neighbourhood.",
    "Construction dust is affecting shops and houses throughout the day.",
    "Several houses have been without water for more than a day.",
    "The drain near the school is clogged and water collects across the entrance when it rains.",
    "Garbage bags have been left uncollected along the street for several days.",
    "Three street lamps near the bus stand are not working.",
    "A leaking pipe is creating a constant flow of water along the roadside.",
    "The main road has multiple damaged sections that are making travel difficult.",
    "Wastewater from a blocked drain is spreading onto the road near the market.",
    "Residents are experiencing repeated power cuts during the evening.",
    "A pile of dumped rubbish near the residential area is attracting insects.",
    "The road near the school has several deep potholes that drivers are avoiding.",
    "Water supply has been unreliable across the area for the past two days.",
    "A large drain near the market is blocked and water is collecting around nearby shops.",
    "Several waste bins in the public area are full and have not been emptied.",
    "Street lighting on one side of the main road is not functioning.",
    "Smoke and dust from construction are affecting nearby residents during working hours.",
    "A public water line is leaking enough to create a stream along the roadside.",
    "The road surface has deteriorated badly near the bus stop.",
    "A sewer near the hospital is blocked and producing a strong smell.",
    "Electricity interruptions are affecting many houses in the residential area.",
    "Garbage collection was missed twice this week and waste is accumulating.",
    "Rainwater is collecting across half of the road because the drain is blocked.",
    "Several street lamps in our neighbourhood have been out for three nights.",
    "Residents are receiving very low water pressure throughout the day.",
    "A pile of construction waste has been left beside the public road.",
    "The market access road has multiple potholes and damaged edges.",
    "Wastewater is leaking from a drain and spreading along the roadside.",
    "A workshop is producing smoke that can be smelled inside nearby houses.",
    "The water supply has stopped for many homes since last night.",
    "A large rubbish pile has been left near the bus stop for several days.",
    "The road near the community hall is badly cracked and uneven.",
    "Several homes are affected by repeated electricity failures.",
    "A drainage channel is blocked and water is collecting in nearby gardens.",
    "A large amount of water is being wasted from a damaged public pipe.",
    "Several street lights near the market are not turning on at night.",
    "Garbage has accumulated near the residential area because collection has been delayed."
]

records.extend(
    {"complaint_text": text, "priority": "medium"}
    for text in medium
)

assert len(medium) == 50

# =========================================================
# HIGH PRIORITY - 50
# =========================================================

high = [
    "An exposed electrical cable is hanging low beside the school entrance where children are walking.",
    "A large section of road has collapsed across one lane near a busy junction.",
    "A major water pipe has burst and water is entering several nearby houses.",
    "Sewage is overflowing from a manhole and flowing into homes beside the road.",
    "A damaged electricity pole is leaning over the main road.",
    "Dense smoke from a nearby building is causing residents to leave their houses.",
    "A deep hole has opened across most of the traffic lane near a sharp bend.",
    "Electrical wires are sparking beside a crowded pedestrian area.",
    "Floodwater has entered several houses and the water level is still rising.",
    "A chemical liquid has leaked onto the road beside residential buildings.",
    "A fallen power cable is lying across the footpath near the market.",
    "Part of a roadside wall has collapsed onto the traffic lane.",
    "A burst water main is flooding the entrance to the hospital.",
    "Sewage is spreading across the access road used by school children.",
    "Thick smoke from a nearby facility is causing breathing difficulty for residents.",
    "A live electrical wire is lying on the ground near the bus stand.",
    "The road has collapsed near the bridge and vehicles cannot pass safely.",
    "A large water pipe has burst and is flooding the lower floors of nearby homes.",
    "Sewage is entering houses through overflowing drains.",
    "A damaged lamp post has fallen partly across the road with wires attached.",
    "Floodwater is moving rapidly through the residential street and entering properties.",
    "A strong chemical spill is spreading across a public walkway.",
    "Electrical cables are exposed and producing sparks near the school gate.",
    "A large sinkhole has opened in the road near the public market.",
    "A broken sewer line is releasing sewage into several homes.",
    "A power pole has cracked and is leaning toward a crowded road.",
    "Heavy smoke is filling nearby houses and residents are struggling to breathe.",
    "A major section of the road has washed away after heavy rain.",
    "A burst pipeline is sending water into the hospital access area.",
    "A fallen electrical cable is blocking the entrance to several houses.",
    "Sewage is flowing across the road and into a nearby school compound.",
    "A large chemical leak has occurred beside the residential area.",
    "An exposed electrical box is sparking near pedestrians.",
    "A deep road collapse has opened near a busy pedestrian crossing.",
    "Floodwater has reached inside several homes after the drain system failed.",
    "A damaged electricity pole is hanging over the road after a vehicle collision.",
    "A major water line has ruptured and water is entering shops near the market.",
    "Sewage is overflowing continuously into the ground floor of nearby buildings.",
    "Thick black smoke is spreading across the residential area from a nearby workshop.",
    "Electrical wires have fallen across the entrance to the playground.",
    "A large section of the bridge approach road has collapsed.",
    "A chemical substance has spilled near houses and is producing strong fumes.",
    "A live cable is hanging at head height beside the public footpath.",
    "Flooding has trapped several houses and water continues to rise.",
    "A large sinkhole has formed directly in front of the school gate.",
    "A sewer failure is causing sewage to enter homes along the street.",
    "A damaged power pole is leaning toward the hospital entrance.",
    "Heavy smoke is entering homes and causing breathing problems for children and elderly residents.",
    "A burst water main has flooded the road and several nearby properties.",
    "Electrical wiring is sparking from a damaged pole beside a busy bus stop."
]

records.extend(
    {"complaint_text": text, "priority": "high"}
    for text in high
)

assert len(high) == 50

# =========================================================
# CREATE + VALIDATE
# =========================================================

df = pd.DataFrame(records)

if len(df) != 150:
    raise ValueError(
        f"Expected 150 records, found {len(df)}"
    )

expected = {"low", "medium", "high"}

if set(df["priority"].unique()) != expected:
    raise ValueError(
        "Unexpected priority labels detected."
    )

counts = df["priority"].value_counts()

if not (counts == 50).all():
    raise ValueError(
        f"Each priority must contain 50 records:\n{counts}"
    )

duplicates = df["complaint_text"].duplicated().sum()

if duplicates != 0:
    raise ValueError(
        f"Duplicate complaints detected: {duplicates}"
    )

df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8"
)

print("=" * 70)
print("MANUAL UNSEEN PRIORITY TEST DATASET CREATED")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_PATH}")

print(f"\nDataset Shape: {df.shape}")

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
    .head(10)
    .to_string(index=False)
)