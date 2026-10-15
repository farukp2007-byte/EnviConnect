import math
from typing import Tuple, Optional, Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np

# Comprehensive realistic bootstrap training corpus for environmental incident classification
TRAINING_DATA = [
    # ILLEGAL DUMPING
    ("Massive pile of municipal solid waste and garbage bags dumped on roadside blocking pedestrian walkway", "illegal_dumping", "medium"),
    ("Commercial trucks dumping construction and demolition debris, concrete blocks and bricks near empty plot", "illegal_dumping", "medium"),
    ("Heaps of rotting plastic waste, food scraps and household trash burning openly with foul smell", "illegal_dumping", "high"),
    ("Hazardous biomedical waste syringes, medicine vials and hospital trash discarded behind market", "illegal_dumping", "critical"),
    ("Illegal landfill created near residential colony with mountain of unsegregated waste attracting stray dogs", "illegal_dumping", "high"),
    ("Littering of plastic bottles, wrappers and styrofoam plates along temple walkway", "illegal_dumping", "low"),
    ("Discarded electronic waste, old batteries, broken monitors and cables dumped in vacant lot", "illegal_dumping", "high"),
    ("Overflowing community garbage dumper with waste spilling onto road for three days", "illegal_dumping", "medium"),
    ("Restaurant dumping grease, food waste and raw chicken refuse in open storm drain", "illegal_dumping", "high"),
    ("Old vehicle tires piled high and abandoned creating mosquito breeding ground", "illegal_dumping", "medium"),
    ("Construction rubble dumped overnight on pavement preventing vehicles from passing", "illegal_dumping", "low"),

    # AIR POLLUTION
    ("Factory chimney spewing dense black toxic smoke and soot directly into residential atmosphere", "air_pollution", "critical"),
    ("Severe burning of agricultural crop stubble and paddy straw causing thick blinding smog", "air_pollution", "high"),
    ("Illegal tyre burning and plastic waste open incineration producing acrid suffocating chemical smoke", "air_pollution", "critical"),
    ("Stone crushing unit operating without water sprinklers causing heavy particulate dust cloud PM2.5 PM10", "air_pollution", "high"),
    ("Heavy diesel smoke and unburned hydrocarbon emissions from overloaded commercial trucks without pollution check", "air_pollution", "medium"),
    ("Toxic chemical pungent gas leak odor causing throat irritation and burning eyes in nearby neighborhood", "air_pollution", "critical"),
    ("Uncovered sand and cement trucks spilling fine dust all along the highway during transit", "air_pollution", "low"),
    ("Brick kiln operating without induced draft chimney releasing continuous thick grey smoke", "air_pollution", "high"),
    ("Open leaf burning and garden waste burning in park causing smoke nuisance to morning walkers", "air_pollution", "low"),
    ("Paint and solvent manufacturing unit releasing unbearable chemical fumes during nighttime", "air_pollution", "high"),

    # WATER POLLUTION
    ("Untreated industrial chemical effluent with purple dye discharged straight into Swarnamukhi river", "water_pollution", "critical"),
    ("Massive fish kill in community lake due to sudden drop in dissolved oxygen and chemical contamination", "water_pollution", "critical"),
    ("Raw untreated sewage pipeline burst draining directly into public drinking water canal", "water_pollution", "critical"),
    ("Industrial tanker secretly emptying toxic acidic liquid waste into drainage channel at midnight", "water_pollution", "critical"),
    ("Foaming frothing toxic water with foul odor near check dam, soapy sludge floating on surface", "water_pollution", "high"),
    ("Temple pond water turned green and murky with algae bloom and floating plastic waste", "water_pollution", "medium"),
    ("Car service center washing bay discharging motor oil, grease and detergent directly into storm water drain", "water_pollution", "medium"),
    ("Construction site pumping muddy slurry water and cement wash directly into open pond", "water_pollution", "low"),
    ("Dead animal floating in irrigation canal contaminating agricultural water supply", "water_pollution", "high"),
    ("Groundwater borewell yielding discolored yellow water with pungent sulfur odor near industrial estate", "water_pollution", "critical"),

    # DEFORESTATION
    ("Illegal felling and cutting of mature red sanders trees and teak wood inside Seshachalam forest zone", "deforestation", "critical"),
    ("Heavy earthmover excavating and clearing forest hill slopes for unauthorized private resort construction", "deforestation", "critical"),
    ("Commercial timber logging gang cutting protected banyan and tamarind trees along highway", "deforestation", "high"),
    ("Encroachment into protected reserve forest land with bulldozers uprooting natural vegetation", "deforestation", "high"),
    ("Uncontrolled forest fire set intentionally to clear scrub jungle land for cattle grazing", "deforestation", "critical"),
    ("Illegal pruning and total chopping down of avenue shade trees without municipal corporation permit", "deforestation", "medium"),
    ("Removal of green cover and mangrove buffer along stream banks for illegal sand mining", "deforestation", "high"),
    ("Poaching traps and tree girdling noticed inside reserved biodiversity zone", "deforestation", "high"),
    ("Clearing of private grove trees without tree officer permission in urban ward", "deforestation", "low"),

    # NOISE
    ("High decibel loudspeakers and sound amplifiers blaring religious or wedding music beyond 10 PM limit", "noise", "medium"),
    ("Industrial metal cutting and fabrication unit operating noisy heavy machinery throughout the night in quiet residential zone", "noise", "high"),
    ("Commercial generator running without acoustic enclosure vibrating walls of adjacent hospital", "noise", "high"),
    ("Nighttime construction work with pneumatic drills and concrete mixers after 11 PM keeping entire neighborhood awake", "noise", "medium"),
    ("Modified motorcycle and car exhausts producing deafening loud pop and bang noises in silent hospital zone", "noise", "low"),
    ("Illegal use of cone speakers on vehicles for political rally exceeding 100 dB near school during exam hours", "noise", "high"),
    ("Fireworks and firecrackers burst continuously in midnight hours disturbing senior citizens and patients", "noise", "medium"),
    ("Pub rooftop DJ playing bass heavy electronic music with open sound outdoors past 2 AM", "noise", "high"),

    # OTHER
    ("Broken street light fixture dangling dangerously over pedestrian walkway with exposed wires", "other", "low"),
    ("Illegal billboard hoarding installed without stability clearance posing hazard during heavy winds", "other", "low"),
    ("Encroachment of public footpath by temporary fruit vendors and tea stalls", "other", "low"),
    ("Pothole filled damaged road causing severe traffic congestion near school junction", "other", "low"),
    ("Stray cattle herd roaming freely on main highway causing traffic accidents", "other", "low")
]

class EnvironmentalMLEngine:
    def __init__(self):
        self.category_pipeline: Optional[Pipeline] = None
        self.severity_pipeline: Optional[Pipeline] = None
        self._train_models()

    def _train_models(self):
        texts = [item[0] for item in TRAINING_DATA]
        categories = [item[1] for item in TRAINING_DATA]
        severities = [item[2] for item in TRAINING_DATA]

        # Category Pipeline
        self.category_pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=1500, sublinear_tf=True)),
            ("clf", LogisticRegression(C=1.5, max_iter=500, random_state=42))
        ])
        self.category_pipeline.fit(texts, categories)

        # Severity Pipeline
        self.severity_pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=1500, sublinear_tf=True)),
            ("clf", LogisticRegression(C=1.5, max_iter=500, random_state=42))
        ])
        self.severity_pipeline.fit(texts, severities)

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Analyzes the description text and suggests category, severity, and confidence score.
        """
        if not text or len(text.strip()) < 5:
            return {
                "category": "other",
                "severity": "medium",
                "confidence": 0.5,
                "keywords": []
            }

        cleaned = text.strip()
        cat_probs = self.category_pipeline.predict_proba([cleaned])[0]
        cat_classes = self.category_pipeline.classes_
        cat_idx = np.argmax(cat_probs)
        predicted_cat = cat_classes[cat_idx]
        cat_confidence = float(cat_probs[cat_idx])

        sev_probs = self.severity_pipeline.predict_proba([cleaned])[0]
        sev_classes = self.severity_pipeline.classes_
        sev_idx = np.argmax(sev_probs)
        predicted_sev = sev_classes[sev_idx]
        sev_confidence = float(sev_probs[sev_idx])

        # Heuristic keywords detection for transparency
        keywords_map = {
            "illegal_dumping": ["dump", "garbage", "trash", "waste", "debris", "plastic", "rubbish", "litter", "biomedical"],
            "air_pollution": ["smoke", "smog", "chimney", "toxic", "dust", "fumes", "soot", "stubble", "burning", "odor", "emission"],
            "water_pollution": ["effluent", "river", "canal", "lake", "drain", "sewage", "chemical", "fish kill", "foaming", "acid", "sludge"],
            "deforestation": ["tree", "cutting", "felling", "forest", "timber", "wood", "red sanders", "bulldozing", "clearing", "reserve"],
            "noise": ["loudspeaker", "music", "generator", "decibel", "sound", "noise", "horn", "exhaust", "blaring", "dj"]
        }

        matched_keywords = []
        lower_text = cleaned.lower()
        for kw in keywords_map.get(predicted_cat, []):
            if kw in lower_text:
                matched_keywords.append(kw)

        # Severity keywords override
        critical_words = ["fatal", "hospital", "dying", "fish kill", "acid", "cyanide", "biomedical", "poisonous", "suffocating", "severe fire", "emergency"]
        if any(w in lower_text for w in critical_words):
            predicted_sev = "critical"
            sev_confidence = max(sev_confidence, 0.92)

        return {
            "category": predicted_cat,
            "severity": predicted_sev,
            "confidence": round((cat_confidence + sev_confidence) / 2.0, 2),
            "category_confidence": round(cat_confidence, 2),
            "severity_confidence": round(sev_confidence, 2),
            "keywords": matched_keywords[:5]
        }


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two GPS points in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


# Global ML Engine instance
ml_engine = EnvironmentalMLEngine()
