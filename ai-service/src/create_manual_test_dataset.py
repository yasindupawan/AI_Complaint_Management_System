import pandas as pd
from pathlib import Path

OUTPUT_PATH = Path("../datasets/manual_unseen_test_dataset.csv")

records = []

# =========================================================
# ROADS - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

roads = [
    "A deep pothole has appeared in front of the village school and vehicles are swerving to avoid it.",
    "The road leading to the public market is badly cracked and difficult to drive on.",
    "Several large holes have developed along our lane after the recent rain.",
    "The surface of the main road near the junction has broken apart.",
    "A section of the road has sunk near the bus stand and could cause an accident.",
    "The road outside our house is badly damaged and motorcycles are having trouble passing safely.",
    "There is a dangerous hole in the middle of the street near the hospital.",
    "The village access road needs repairs because the surface is uneven and full of cracks.",
    "Part of the road near the bridge has collapsed and drivers have to move into the opposite lane.",
    "The asphalt surface near the town centre is peeling away and getting worse every day.",
    "A large pothole near the pedestrian crossing is creating a risk for motorists.",
    "The roadside edge has broken away near our neighbourhood entrance.",
    "The road connecting our village to the main highway is in very poor condition.",
    "There are multiple damaged sections on the street beside the public playground.",
    "A metal cover on the road is damaged and sticking above the surface.",
    "The road near the railway crossing has become rough and difficult for small vehicles.",
    "A repaired section of the street has broken again and needs proper maintenance.",
    "The curb beside the bus stop is broken and pieces of concrete are scattered on the road.",
    "There is a sunken section of road outside the local clinic.",
    "The street surface near the market entrance is badly worn and requires resurfacing.",
    "A wide crack has formed across the road near our housing area.",
    "The road shoulder has deteriorated and vehicles are struggling to pass each other safely.",
    "A pothole on the bend near the school is difficult to see at night.",
    "The concrete road through our village has several broken sections.",
    "The main street has become extremely rough after construction work was completed.",
    "The road near the temple junction has been damaged for several weeks and has not been repaired.",
    "There is a deep depression in the road where rainwater collects and makes driving dangerous.",
    "The surface around a road maintenance cover is broken and uneven.",
    "A section of pavement beside the junction has cracked and started to collapse.",
    "Vehicles are being damaged because of a large hole in the road near the market.",
    "The road outside the community hall is uneven and needs urgent repair.",
    "The recently repaired street has already developed several cracks.",
    "There is serious damage to the road surface close to the bus depot.",
    "The curb along our residential street has broken in several places.",
    "Part of the asphalt road has washed away after heavy rainfall.",
    "The road leading to the school is full of holes and is unsafe for daily travel.",
    "There is a raised metal object in the roadway that could damage vehicle tyres.",
    "The street near the public library has a damaged surface and loose pieces of asphalt.",
    "A large section of the road has become uneven near the entrance to our village.",
    "The lane behind the market has not been repaired and is becoming increasingly difficult to use.",
    "The road surface at the junction is badly worn because of heavy vehicle traffic.",
    "There is a broken curb beside the pedestrian walkway that needs to be repaired.",
    "A deep crack in the street is getting wider and may cause the surface to collapse.",
    "The access road to our residential area has several potholes that require attention.",
    "The road near the bus stop is sinking and creates a dangerous bump for vehicles.",
    "The surface of our street was damaged during utility work and has not been properly restored.",
    "A section of the main road has deteriorated and loose stones are spreading across the lane.",
    "The road near the public market is badly pitted and uncomfortable to drive on.",
    "The street outside the school gate has broken asphalt that could be dangerous for children and vehicles.",
    "The village road has deteriorated badly and residents are requesting that it be repaired."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "roads"
    }
    for complaint in roads
)

assert len(roads) == 50

# =========================================================
# WATER SUPPLY - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

water_supply = [
    "There has been no water supply to our houses since yesterday morning.",
    "The taps in our neighbourhood have been dry for the past two days.",
    "Water pressure in our area has become extremely low and upstairs houses are receiving no water.",
    "A water pipe beside the main road is leaking continuously and wasting a large amount of water.",
    "Residents near the school are receiving dirty brown water from their taps.",
    "A pipe appears to have burst near the junction and clean water is flowing across the road.",
    "Our household water supply stops for several hours every day without notice.",
    "The drinking water in our area has developed an unusual smell.",
    "Water coming from the taps is cloudy and does not look safe to drink.",
    "Several families in our lane have had no running water since last night.",
    "There is a major leak in the water line near the public market.",
    "The water pressure has dropped significantly throughout our residential area.",
    "Residents are receiving discoloured water after the recent repair to the main pipeline.",
    "A damaged water pipe outside our house has been leaking for several days.",
    "No water is reaching the houses at the end of our street.",
    "The tap water has a strange taste and residents are concerned about its quality.",
    "A possible water main break near the bus stand is causing water to flow onto the street.",
    "Our neighbourhood has been experiencing an unreliable water supply throughout the week.",
    "The public water line near the hospital is leaking and the surrounding ground is becoming flooded.",
    "Water from our taps contains visible particles and needs to be checked.",
    "The supply pressure is too weak for residents living on higher ground.",
    "A roadside water pipe is damaged and clean water has been running into the drain all day.",
    "The entire lane has been without water since early this morning.",
    "Residents noticed a strong chlorine-like smell in the drinking water.",
    "The main water pipe near our village entrance appears to be leaking underground.",
    "We are only receiving a very small amount of water through the taps.",
    "The water supplied to our homes looks muddy after heavy rainfall.",
    "There is a continuous leak from the public water line beside the community hall.",
    "Families in this area are experiencing frequent interruptions to the water supply.",
    "The water coming from our kitchen tap has an unusual colour and smell.",
    "A broken pipeline near the school is causing a large amount of water to be wasted.",
    "Our street has had very poor water pressure for the last three days.",
    "Residents cannot get enough water for normal household use because the supply is too weak.",
    "There may be a leak in the underground water main because water is coming through the road surface.",
    "The drinking water tastes metallic and residents would like the supply checked.",
    "Water service to several houses near the junction has suddenly stopped.",
    "A leaking public pipe has created a constant stream of water along the roadside.",
    "The water supply is available only for a short time each day and residents are struggling.",
    "Tap water in our area has become cloudy and has an unpleasant odor.",
    "A damaged water connection near the market needs immediate attention.",
    "There is no water at the public taps used by families in our neighbourhood.",
    "The water pressure becomes extremely low during the daytime and many homes receive nothing.",
    "A large amount of clean water is leaking from a pipe near the bus stop.",
    "Residents are concerned because the supplied water has recently changed colour.",
    "Our houses have been without a reliable water supply for several days.",
    "The main distribution pipe appears to be broken near the residential area.",
    "The water from the tap smells unusual and may not be suitable for drinking.",
    "A leak from the public water network is causing water to collect beside the road.",
    "Several homes are receiving very little water even when the supply is supposed to be available.",
    "Please inspect the water system because residents in our village are experiencing repeated supply failures."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "water_supply"
    }
    for complaint in water_supply
)

assert len(water_supply) == 50

# =========================================================
# DRAINAGE - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

drainage = [
    "The roadside drain near our house is blocked and dirty water is overflowing onto the street.",
    "Sewage has started backing up from a drain near the public market.",
    "The drains along our lane cannot carry rainwater and the road floods whenever it rains.",
    "A drainage channel near the school is completely blocked with mud and debris.",
    "Wastewater is overflowing from a manhole close to the bus stand.",
    "Rainwater remains on the road for several hours because the nearby drain is not working properly.",
    "The main drain in our neighbourhood is clogged and water is entering nearby properties.",
    "There is a strong sewage smell coming from the drainage system near our houses.",
    "A blocked roadside drain is causing water to collect in front of the local shops.",
    "The drainage line near the junction overflows every time there is heavy rain.",
    "Sewage water is coming out of a manhole and flowing along the road.",
    "The drain outside our building has been blocked for several days and needs cleaning.",
    "Rainwater has nowhere to flow because the drainage channel beside the road is filled with soil.",
    "The street near the market becomes flooded because the catch basin appears to be clogged.",
    "There is stagnant dirty water in the roadside drain near the residential area.",
    "A damaged drainage line is leaking wastewater near the entrance to our village.",
    "The culvert under the road appears to be blocked and water is collecting on both sides.",
    "Residents are experiencing repeated flooding because the storm drains are not clearing the rainwater.",
    "The sewer near the hospital is overflowing and creating an unpleasant smell.",
    "Water is collecting around the junction because the drainage outlet is blocked.",
    "The roadside drainage system needs cleaning before the next heavy rainfall.",
    "Dirty water from the drain is overflowing into the pedestrian walkway.",
    "A sewer line behind the public market appears to be blocked and wastewater is backing up.",
    "The drain near the bus stop is full of rubbish and rainwater cannot pass through it.",
    "Several houses are affected by flooding because the neighbourhood drainage channel is obstructed.",
    "Wastewater has been leaking from the drainage system near our residential lane.",
    "The manhole near the school overflows during rainfall and covers the road with dirty water.",
    "A blocked culvert is preventing water from flowing away from the main road.",
    "The drainage channel beside our property is overflowing and needs immediate cleaning.",
    "There is sewage leaking onto the street from a damaged underground drain.",
    "The road remains covered with water after rain because the nearby storm drain is blocked.",
    "Residents have noticed sewage backing up through the drainage openings near their homes.",
    "A large puddle keeps forming near the junction because there is no proper drainage.",
    "The open drain near the community hall is blocked and has started overflowing.",
    "Rainwater is entering several gardens because the roadside drainage system cannot handle the flow.",
    "The sewer system near our lane has developed a blockage and produces a strong bad smell.",
    "Water from the drain is flowing across the road instead of through the drainage channel.",
    "The catch basin near the market entrance appears to be clogged with waste.",
    "There is persistent flooding near the bus stop even after light rainfall.",
    "A damaged manhole is allowing sewage water to overflow onto the roadside.",
    "The drainage channel near the playground is filled with sediment and needs to be cleared.",
    "Our street floods quickly during rain because the drains have not been cleaned.",
    "Wastewater is collecting behind several houses due to a blocked drainage pipe.",
    "The drain beside the main road is overflowing and making it difficult for pedestrians to pass.",
    "There is standing dirty water near our houses because the drainage outlet is not functioning.",
    "A sewer blockage near the town centre is causing wastewater to rise through a manhole.",
    "The roadside culvert needs cleaning because rainwater is unable to flow through it.",
    "Floodwater is entering the market area because the nearby drainage system is obstructed.",
    "The drain outside the school is clogged and water spreads across the entrance whenever it rains.",
    "Please inspect the drainage system in our neighbourhood because repeated flooding and wastewater overflow are affecting residents."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "drainage"
    }
    for complaint in drainage
)

assert len(drainage) == 50

# =========================================================
# GARBAGE - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

garbage = [
    "Household garbage on our street has not been collected for several days.",
    "A large pile of rubbish has been dumped beside the main road near the market.",
    "Waste bins near the bus stand are overflowing and rubbish is spreading onto the pavement.",
    "Garbage has been left along the roadside near our neighbourhood entrance.",
    "The waste collection vehicle has not visited our lane this week.",
    "Several bags of household waste have been illegally dumped near the school.",
    "The public area beside the market is covered with litter and needs cleaning.",
    "Residents are complaining because rubbish has not been collected from our area.",
    "An overflowing garbage container near the junction is creating an unpleasant smell.",
    "Someone has dumped construction waste beside the village road.",
    "The roadside near the bus stop is covered with plastic bottles and food waste.",
    "Household rubbish is accumulating because the scheduled collection did not take place.",
    "There is a large amount of waste scattered around the public playground.",
    "Garbage bags have been left beside the road for nearly a week without collection.",
    "The area behind the market has become dirty because people are dumping rubbish there.",
    "A public waste bin outside the hospital is full and needs to be emptied.",
    "Residents have noticed illegal dumping of household waste near the canal.",
    "The street needs cleaning because loose rubbish is spread along the roadside.",
    "Waste from nearby shops has been dumped on the pavement near the junction.",
    "The garbage collection service has repeatedly missed our residential lane.",
    "A pile of old furniture and other bulky waste has been left beside the road.",
    "The public market area has not been cleaned properly and waste is accumulating.",
    "Rubbish around the bus stop is creating an unsanitary environment for passengers.",
    "Several garbage bags have been dumped near the entrance to the school.",
    "Our neighbourhood waste collection was missed and bins are now overflowing.",
    "There is loose household rubbish scattered across the roadside near our houses.",
    "A large pile of discarded materials needs to be removed from the public walkway.",
    "The garbage bin near the community hall has not been emptied and is overflowing.",
    "People are dumping waste in an empty area beside the residential street.",
    "The road near the market needs cleaning because rubbish has accumulated along both sides.",
    "Recyclable waste that was placed for collection has not been picked up.",
    "Residents are requesting removal of a large amount of illegally dumped rubbish.",
    "The waste collection team has not collected the garbage from our street on the scheduled day.",
    "Plastic waste and food containers are scattered around the public park.",
    "An overflowing rubbish bin near the shops is attracting insects and producing a bad smell.",
    "Bulk household waste left beside the road has not been removed.",
    "The pavement near the town centre is dirty because waste has been dumped there.",
    "Garbage is accumulating outside several houses because collection has been delayed.",
    "The area around the public market entrance is covered with discarded packaging and litter.",
    "Someone has left a large pile of rubbish near the bus stop during the night.",
    "Our recycling materials were not collected with the scheduled waste pickup.",
    "The roadside needs cleaning because people continue to throw rubbish into the area.",
    "Waste containers in the public area are full and garbage is falling onto the ground.",
    "Residents have reported repeated illegal dumping near the village entrance.",
    "There is an abandoned pile of household waste behind the community centre.",
    "The street has become dirty because loose rubbish has not been cleared.",
    "Garbage collection has been missed for several days and residents have nowhere to place additional waste.",
    "A large amount of discarded material has been dumped beside the public road.",
    "The waste collection point near our neighbourhood is overflowing and needs immediate attention.",
    "Please arrange garbage collection and cleaning because waste is accumulating throughout our residential area."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "garbage"
    }
    for complaint in garbage
)

assert len(garbage) == 50

# =========================================================
# ELECTRICITY - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

electricity = [
    "All the street lights along our lane have stopped working since last night.",
    "The street lamp near the school entrance is not working and the area is very dark at night.",
    "There has been a power failure affecting several houses in our neighbourhood.",
    "A damaged electrical wire is hanging from a pole beside the main road.",
    "The street light near the bus stop keeps switching on and off throughout the night.",
    "Several lamps along the road to the public market are not working.",
    "There is an exposed electrical cable near the pedestrian walkway that could be dangerous.",
    "Our residential area has been without electricity since early this morning.",
    "A street light pole near the junction appears to have been damaged by a vehicle.",
    "The lamp outside our community hall is very dim and provides almost no light.",
    "Residents have noticed sparks coming from electrical wires near a roadside pole.",
    "The street lighting system in our neighbourhood has not been working for the past two nights.",
    "A utility pole beside the road is leaning and the electrical cables appear unsafe.",
    "There is a broken street lamp near the hospital that needs to be repaired.",
    "Several houses are experiencing repeated power interruptions during the evening.",
    "An electrical cable is exposed close to the school gate and may pose a safety risk.",
    "The street lamp at the main junction remains on during the daytime but does not work properly at night.",
    "Our lane becomes completely dark because none of the public street lights are functioning.",
    "A damaged lamp post near the market is leaning towards the road.",
    "The electricity supply in our area keeps cutting off several times each day.",
    "One of the street light fixtures is hanging loosely above the pavement.",
    "A power line near our house appears to be damaged and needs inspection.",
    "The street lights near the bus stand have been out for more than a week.",
    "There is a loose electrical wire hanging low over the roadside.",
    "Residents are concerned about an open electrical box near the public walkway.",
    "The lamp post outside the school was knocked down and has not yet been repaired.",
    "We have had no electricity in several homes since the heavy rain last night.",
    "The street light near our village entrance flashes continuously instead of staying on.",
    "An exposed wire at the base of a lamp post could be dangerous to pedestrians.",
    "The public road is very dark at night because multiple street lights are not working.",
    "There appears to be a fault in the electrical supply affecting our residential street.",
    "A street lamp beside the market has been damaged and the fixture is hanging down.",
    "The electricity supply has become unstable and residents are experiencing frequent outages.",
    "The light on the pole near the junction is extremely dim and needs replacement.",
    "Electrical wiring near the roadside has become exposed after the protective cover was damaged.",
    "Several street lamps between the school and the bus stop are not turning on at night.",
    "The power supply to our neighbourhood has been interrupted for several hours.",
    "A damaged electrical pole near the main road may fall if it is not repaired.",
    "There is an open cover at the bottom of a street lamp with wires visible inside.",
    "The street lighting near the public playground has not worked for several days.",
    "Residents are experiencing voltage and electricity interruptions in the area.",
    "A broken street light fixture is hanging over the road and could fall onto vehicles.",
    "The lamp near the pedestrian crossing does not turn on at night.",
    "There are exposed electrical wires beside the bus stop that need urgent attention.",
    "Our street has several faulty lamps and people are finding it difficult to walk safely at night.",
    "Electricity has been unavailable in our part of the village since yesterday evening.",
    "A street light pole has been damaged near the residential area and the wiring is visible.",
    "The lights along the main road keep going off unexpectedly during the night.",
    "A public lamp outside the market is not functioning and the surrounding area is completely dark.",
    "Please inspect the electrical system in our area because repeated power failures and damaged street lights are affecting residents."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "electricity"
    }
    for complaint in electricity
)

assert len(electricity) == 50

# =========================================================
# ENVIRONMENT - 50 INDEPENDENT TEST COMPLAINTS
# =========================================================

environment = [
    "Thick black smoke from a nearby workshop is affecting people living in our neighbourhood.",
    "There is a strong chemical smell coming from a building near the residential area.",
    "Construction work near the school is producing a large amount of dust throughout the day.",
    "Residents are concerned about heavy smoke being released near their homes.",
    "A bad chemical odor has been present around the public market since yesterday.",
    "Dust from a nearby construction site is spreading into surrounding houses.",
    "A vehicle is releasing excessive smoke while remaining parked near the bus stand.",
    "There is an unusual smell in the air near our neighbourhood that is causing discomfort.",
    "Residents have noticed oil spilled across the roadside near the junction.",
    "A large number of mosquitoes have appeared around the residential area.",
    "Smoke from a nearby facility is making it difficult for residents to breathe comfortably.",
    "There is a strong unpleasant odor coming from a commercial property near our houses.",
    "Construction dust is covering nearby homes and creating poor air conditions.",
    "An oily substance has been spilled on the road close to the public market.",
    "Residents are worried about fumes coming from a workshop near the school.",
    "There has been a noticeable increase in mosquitoes around our houses during the past week.",
    "A strong smell similar to chemicals is spreading through our neighbourhood.",
    "Heavy dust from demolition work is affecting pedestrians and nearby residents.",
    "Smoke is being released continuously from a building close to the residential area.",
    "There appears to be an oil spill beside the main road near the bus stop.",
    "People living near the workshop are complaining about strong fumes in the air.",
    "The air around the market has an unpleasant smell that has continued for several days.",
    "A construction project beside our street is creating excessive dust.",
    "Residents are concerned about possible chemical fumes coming from a nearby property.",
    "There are unusually large numbers of mosquitoes around the playground and nearby houses.",
    "Smoke from vehicles waiting near the junction is affecting the surrounding area.",
    "A substance that looks like oil has leaked onto the public road.",
    "The air quality around our neighbourhood has become poor because of constant smoke.",
    "Strong fumes from a nearby business are entering houses in the residential area.",
    "Dust from road construction is spreading across the neighbourhood and covering nearby properties.",
    "There is a persistent burning smell in the air near the public market.",
    "Residents have reported an unknown chemical odor near the village entrance.",
    "A workshop is producing smoke and fumes that are affecting nearby families.",
    "There is excessive dust in the air around the school because of ongoing construction.",
    "An oil-like liquid has been spilled along the roadside and needs to be investigated.",
    "Mosquito numbers have increased significantly around stagnant areas near our neighbourhood.",
    "The smell of smoke is very strong around the residential street during the evening.",
    "People near the bus stand are being affected by fumes from vehicles left running for long periods.",
    "There is a strange odor coming from an industrial property close to our homes.",
    "Dust from demolition activities is spreading over the nearby road and houses.",
    "Residents are experiencing poor air conditions because of smoke from a nearby facility.",
    "A possible chemical spill has occurred near the roadside and there is a strong smell in the area.",
    "There is a large mosquito problem around the public playground and surrounding homes.",
    "Heavy smoke from a commercial building is spreading across the neighbourhood.",
    "Residents are concerned about a strong unknown odor that appears every evening.",
    "Construction activities near our lane are producing excessive airborne dust.",
    "There is oil covering part of the road near the market entrance.",
    "Fumes from a nearby workshop are causing discomfort to people in surrounding houses.",
    "The air near the junction has become smoky because vehicles are constantly idling there.",
    "Please investigate the environmental conditions in our area because residents are being affected by smoke, dust and unpleasant fumes."
]

records.extend(
    {
        "complaint_text": complaint,
        "category": "environment"
    }
    for complaint in environment
)

assert len(environment) == 50

# =========================================================
# CREATE AND VALIDATE FINAL TEST DATASET
# =========================================================

df = pd.DataFrame(records)

expected_categories = {
    "roads",
    "water_supply",
    "drainage",
    "garbage",
    "electricity",
    "environment",
}

if len(df) != 300:
    raise ValueError(
        f"Expected 300 records, but found {len(df)}."
    )

if set(df["category"].unique()) != expected_categories:
    raise ValueError(
        "Unexpected or missing categories detected."
    )

category_counts = df["category"].value_counts()

if not (category_counts == 50).all():
    raise ValueError(
        f"Each category must contain 50 records:\n{category_counts}"
    )

duplicate_count = df["complaint_text"].duplicated().sum()

if duplicate_count != 0:
    raise ValueError(
        f"Duplicate complaint texts detected: {duplicate_count}"
    )

# Shuffle records without changing labels
df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)

# Save
df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8"
)

print("=" * 70)
print("MANUAL UNSEEN TEST DATASET CREATED")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_PATH}")

print(f"\nDataset Shape: {df.shape}")

print("\nCategory Distribution:")
print(
    df["category"]
    .value_counts()
    .sort_index()
)

print(
    "\nDuplicate Complaint Texts:",
    df["complaint_text"].duplicated().sum()
)

print(
    "Unique Complaint Texts:",
    df["complaint_text"].nunique()
)

print("\nSample:")
print(
    df[
        ["complaint_text", "category"]
    ]
    .head(10)
    .to_string(index=False)
)