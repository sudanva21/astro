import json
import os
import re
import shutil

# --- Configuration ---
# NOTE: This is a standalone test script. For production use, import compression_service.py
import argparse

def get_config():
    """Get configuration from command line or defaults"""
    parser = argparse.ArgumentParser(description="Compress horoscope data")
    parser.add_argument("--input", default="horoscope-complete-DASHA.json", help="Input JSON file path")
    parser.add_argument("--output", default="./compressed_output", help="Output directory")
    args = parser.parse_args()
    return args.input, args.output

INPUT_FILENAME, OUTPUT_DIR = get_config() if __name__ == "__main__" else ("", "")

# --- Mappings (Readable) ---
# We will use these to ensure standard short names if needed, 
# or just pass through clean names.

PLANET_NAMES = {
    0: "Sun", 1: "Moon", 2: "Mars", 3: "Merc", 4: "Jup", 
    5: "Ven", 6: "Sat", 7: "Rahu", 8: "Ketu", 9: "Asc",
    10: "Uran", 11: "Nept", 12: "Plu"
}

SIGN_NAMES = {
    1: "Ari", 2: "Tau", 3: "Gem", 4: "Can", 5: "Leo", 6: "Vir",
    7: "Lib", 8: "Sco", 9: "Sag", 10: "Cap", 11: "Aqu", 12: "Pis"
}

SIGN_MAP_FROM_STR = {
    "Aries": 1, "Taurus": 2, "Gemini": 3, "Cancer": 4, "Leo": 5, "Virgo": 6,
    "Libra": 7, "Scorpio": 8, "Sagittarius": 9, "Capricorn": 10, "Aquarius": 11, "Pisces": 12
}

def get_sign_id(sign_str):
    clean_sign = re.sub(r"[^a-zA-Z]", "", sign_str)
    for key, val in SIGN_MAP_FROM_STR.items():
        if key in clean_sign:
            return val
    return 0

# --- Compression Logic (Readable) ---
def get_planet_name(p_data):
    # Use mapping from ID if possible for consistency, else clean name
    name = p_data.get("name", "")
    clean_name = re.sub(r"[^a-zA-Z]", "", name)
    
    # Check for standard matches
    if "Sun" in clean_name: return "Sun"
    if "Moon" in clean_name: return "Moon"
    if "Mars" in clean_name: return "Mars"
    if "Mercury" in clean_name: return "Merc"
    if "Jupiter" in clean_name: return "Jup"
    if "Venus" in clean_name: return "Ven"
    if "Saturn" in clean_name: return "Sat"
    if "Raagu" in clean_name or "Rahu" in clean_name: return "Rahu"
    if "Kethu" in clean_name or "Ketu" in clean_name: return "Ketu"
    if "Ascendant" in clean_name: return "Asc"
    if "Uranus" in clean_name: return "Uran"
    if "Neptune" in clean_name: return "Nept"
    if "Pluto" in clean_name: return "Pluto"
    
    return clean_name

def get_sign_name(sign_num):
    return SIGN_NAMES.get(sign_num, str(sign_num))

def round_float_domi(val):
    if isinstance(val, (int, float)):
        return round(val, 2)
    return val

def clean_calendar_value(val):
    if isinstance(val, str):
        val = val.split(" starts at")[0].split(" ends at")[0].split(" from")[0]
        val = re.sub(r'[^\x00-\x7F]+', '', val)
        return val.strip()
    return val

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def compress_planet_readable(p_data):
    if not p_data: return None
    
    name = get_planet_name(p_data)
    if not name: return None

    # Core data
    comp_p = {
        "name": name,
        "house": p_data.get("house"),
        "sign": get_sign_name(get_sign_id(p_data.get("sign", ""))),
        "deg": round_float_domi(p_data.get("rawLongitudeDeg", 0))
    }

    # Nakshatra
    nak = p_data.get("nakshatra")
    pada = p_data.get("nakshatraPada")
    if nak:
        comp_p["nak"] = f"{nak}-{pada}" if pada else nak

    # Boolean Flags (Only if True)
    if p_data.get("retrograde"): comp_p["retrograde"] = True
    if p_data.get("isCombust"): comp_p["combust"] = True
    if p_data.get("isExalted"): comp_p["exalted"] = True
    if p_data.get("isDebilitated"): comp_p["debilitated"] = True
    if p_data.get("isOwnSign"): comp_p["own_sign"] = True
    if p_data.get("isMoolatrikona"): comp_p["moolatrikona"] = True
    if p_data.get("isVargottama"): comp_p["vargottama"] = True
    
    return comp_p

def compress_chart_readable(chart_data):
    if not chart_data: return None

    label = chart_data.get("label", "")
    asc_sign_num = chart_data.get("ascendantSignNumber", 0)
    
    compressed_chart = {
        "label": label,
        "asc_sign": get_sign_name(asc_sign_num),
        "asc_deg": round_float_domi(chart_data.get("ascendantRawLongitudeDeg", 0)),
        "planets": []
    }

    # Grouping by house could be useful for readability too, but list of planets is standard
    for p in chart_data.get("planets", []):
        cp = compress_planet_readable(p)
        if cp:
            compressed_chart["planets"].append(cp)

    return compressed_chart

def process_dasha_2layer(dasha_data):
    if not dasha_data or "vimsottari" not in dasha_data:
        return None

    vim = dasha_data["vimsottari"]
    compressed_dasha = {
        "system": "Vimsottari",
        "periods": []
    }

    # Loop over Mahadashas
    for md in vim.get("periods", []):
        comp_md = {
            "lord": md.get("lord"),
            "start": md.get("start"),
            "antardasha": []
        }
        
        # Loop over Antardashas (Limit depth here, do not recurse further)
        for ad in md.get("antardasha", []):
            comp_ad = {
                "lord": ad.get("lord"),
                "start": ad.get("start")
            }
            comp_md["antardasha"].append(comp_ad)
            
        compressed_dasha["periods"].append(comp_md)

    return compressed_dasha

# --- Main Processing ---
def main():
    print(f"Reading {INPUT_FILENAME}...")
    try:
        with open(INPUT_FILENAME, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Input file not found!")
        return

    # Create output directory
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    ensure_dir(OUTPUT_DIR)
    
    d_series_dir = os.path.join(OUTPUT_DIR, "d_series")
    ensure_dir(d_series_dir)

    # 1. Meta
    meta_data = {}
    if "meta" in data:
        meta_data.update(data["meta"])
    if "calendar" in data:
        clean_cal = {k: clean_calendar_value(v) for k, v in data["calendar"].items()}
        meta_data["calendar"] = clean_cal
    
    with open(os.path.join(OUTPUT_DIR, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta_data, f, indent=2, separators=(',', ': '))
    print("Created meta.json")

    # 2. Lagna
    if "rasiChart" in data:
        lagna_data = compress_chart_readable(data["rasiChart"])
        with open(os.path.join(OUTPUT_DIR, "lagna.json"), "w", encoding="utf-8") as f:
            json.dump(lagna_data, f, indent=2, separators=(',', ': '))
        print("Created lagna.json")

    # 3. Dasha (Modified for 2 layers)
    if "dasha" in data:
        dasha_out = process_dasha_2layer(data["dasha"])
        if dasha_out:
            with open(os.path.join(OUTPUT_DIR, "dasha.json"), "w", encoding="utf-8") as f:
                json.dump(dasha_out, f, indent=2, separators=(',', ': '))
            print("Created dasha.json")

    # 4. D-Series
    charts = data.get("divisionalCharts", [])
    
    for chart in charts:
        label = chart.get("label", "Unknown")
        if label == "Raasi": 
            continue 
        
        match = re.search(r"D-(\d+)", label)
        if match:
            fname = f"D{match.group(1)}.json"
        else:
            safe_label = re.sub(r"[^a-zA-Z0-9]", "_", label)
            fname = f"{safe_label}.json"
        
        compressed_chart = compress_chart_readable(chart)
        
        with open(os.path.join(d_series_dir, fname), "w", encoding="utf-8") as f:
            json.dump(compressed_chart, f, indent=2, separators=(',', ': '))
            
    print(f"Created D-series charts in {d_series_dir}")
    print("Done!")

if __name__ == "__main__":
    main()
