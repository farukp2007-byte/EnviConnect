import io
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_decimal_from_dms(dms, ref):
    if not dms or len(dms) < 3:
        return None
    try:
        degrees = float(dms[0])
        minutes = float(dms[1])
        seconds = float(dms[2])
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ['S', 'W']:
            decimal = -decimal
        return round(decimal, 6)
    except Exception:
        return None

def extract_exif_gps(image_bytes: bytes):
    """
    Extracts GPS coordinates (lat, lng) from image EXIF data if present.
    Returns (lat, lng) or None.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        exif_raw = image._getexif()
        if not exif_raw:
            return None

        gps_info = {}
        for tag_id, value in exif_raw.items():
            tag_name = TAGS.get(tag_id, tag_id)
            if tag_name == "GPSInfo":
                for gps_tag_id, gps_value in value.items():
                    sub_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_info[sub_tag] = gps_value

        if not gps_info:
            return None

        gps_latitude = gps_info.get("GPSLatitude")
        gps_lat_ref = gps_info.get("GPSLatitudeRef")
        gps_longitude = gps_info.get("GPSLongitude")
        gps_lng_ref = gps_info.get("GPSLongitudeRef")

        if gps_latitude and gps_lat_ref and gps_longitude and gps_lng_ref:
            lat = get_decimal_from_dms(gps_latitude, gps_lat_ref)
            lng = get_decimal_from_dms(gps_longitude, gps_lng_ref)
            if lat is not None and lng is not None:
                return lat, lng
        return None
    except Exception:
        return None
