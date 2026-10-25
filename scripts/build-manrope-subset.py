"""Reproduce the RU WOFF2 from pinned Manrope 4.504. Requires fonttools[woff]==4.66.1."""
from pathlib import Path
from hashlib import sha256
from urllib.request import urlopen
from io import BytesIO
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen

ROOT = Path(__file__).resolve().parent.parent
URL = 'https://raw.githubusercontent.com/google/fonts/8f9a401dbb3793e0d1264b15d96aa253f05280f5/ofl/manrope/Manrope%5Bwght%5D.ttf'
SOURCE_SHA = 'd0639be45d0af36e798172419d7bd173c4bd4f29e2b76cbb69db1d11bf8b0a40'
EXPECTED_SHA = 'c6a22272d207c90622e593d2a8db7a8fecf0621015ab92b62d6dae261b1afddd'
source = urlopen(URL, timeout=30).read()
assert sha256(source).hexdigest() == SOURCE_SHA, 'Upstream byte mismatch'
old = [TTFont(ROOT / f'node_modules/@fontsource-variable/manrope/files/manrope-{script}-wght-normal.woff2') for script in ['latin', 'cyrillic']]
assert all(font['name'].getDebugName(5) == 'Version 4.504' for font in old), 'Review changed reference version'
unicodes = set().union(*(set(font.getBestCmap()) for font in old))
font = TTFont(BytesIO(source))
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
options.recalc_timestamp = False
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=unicodes)
subsetter.subset(font)
font.flavor = 'woff2'
checks = 0
for weight in [200, 400, 500, 600, 700, 760, 800]:
    current = font.getGlyphSet(location={'wght': weight})
    for reference in old:
        original = reference.getGlyphSet(location={'wght': weight})
        for codepoint, name in reference.getBestCmap().items():
            new_name = font.getBestCmap()[codepoint]
            before = DecomposingRecordingPen(original)
            after = DecomposingRecordingPen(current)
            original[name].draw(before)
            current[new_name].draw(after)
            assert before.value == after.value, f'Outline changed: {codepoint}, {weight}'
            assert abs(original[name].width - current[new_name].width) < .01, f'Width changed: {codepoint}, {weight}'
            checks += 1
output = BytesIO()
font.save(output)
result = output.getvalue()
assert sha256(result).hexdigest() == EXPECTED_SHA, 'Non-reproducible WOFF2; check fontTools/Brotli versions'
target = ROOT / 'assets/fonts/manrope-latin-cyrillic-wght-normal.woff2'
target.write_bytes(result)
print(f'{checks} equivalent glyph/weight checks; {len(result)} bytes; {EXPECTED_SHA}')
