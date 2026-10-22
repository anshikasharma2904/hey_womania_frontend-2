"""Create web-sized hero videos, keeping the original sources untouched.
Usage: python3 scripts/optimize-hero-media.py [--ffmpeg /path/to/ffmpeg]
"""
import argparse
import pathlib
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parent.parent
jobs = [
    ('phoneVideo.mp4', 'hero-mobile-v1.mp4', 'scale=720:-2:flags=lanczos,fps=24'),
    ('video heywomaniya.mp4', 'hero-desktop-v1.mp4', 'scale=1436:-2:flags=lanczos,fps=30'),
]
for source, name, filters in jobs:
    original = root / 'public' / source
    output = root / 'public/media' / name
    output.parent.mkdir(exist_ok=True)
    subprocess.run([
        args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(original),
        '-map', '0:v:0', '-an', '-vf', filters, '-c:v', 'libx264',
        '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-threads', '2', str(output),
    ], check=True)
    before, after = original.stat().st_size, output.stat().st_size
    print(f'{name}: {before:,} -> {after:,} bytes ({100 * (1-after/before):.1f}% smaller)', flush=True)
