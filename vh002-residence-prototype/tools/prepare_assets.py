"""Rebuild optimized assets from the supplied local media; originals never enter Git."""
from pathlib import Path
from PIL import Image, ImageOps
import subprocess, json, shutil, argparse

root = Path(__file__).resolve().parents[1]
workspace = root.parents[1]
sources = workspace / 'VH002 Design Assets'
ffmpeg = workspace / 'asset-staging-review/video-probe-deps/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
video = sources / 'Drone Footage/DJI_20250303173018_0027_D.MP4.mp4'
assets = root / 'assets'
assets.mkdir(exist_ok=True)
mapping = {'pool':'IMG_9776.jpeg','living':'IMG_9772.jpeg','bedroom':'IMG_9780.jpeg','gazebo':'IMG_9770.jpeg'}
for name, filename in mapping.items():
    original = ImageOps.exif_transpose(Image.open(sources / 'Property Photos' / filename)).convert('RGB')
    for size in (800,1600):
        im = original.copy(); im.thumbnail((size,size))
        im.save(assets / f'{name}-{size}.webp', quality=85, method=6)
morning_source = root.parent / 'vh002-design-review/assets/entrance-morning-edited.png'
if not morning_source.exists(): morning_source = assets / 'entrance-morning-1600.webp'
morning = Image.open(morning_source).convert('RGB')
for size in (800,1600):
    im=morning.copy(); im.thumbnail((size,size)); im.save(assets/f'entrance-morning-{size}.webp',quality=86,method=6)
shutil.copy2(sources/'Property Photos/IMG_9781.jpeg',root/'source-reference/entrance-night-original.jpeg')
for n,name in [(1,'bodoni-regular'),(3,'dm-sans-regular'),(4,'dm-sans-medium')]:
    if not (assets/f'{name}.ttf').exists():
        shutil.copy2(root.parent/f'vh002-design-review/assets/font-{n}.woff2',assets/f'{name}.ttf')

def run(args):
    subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)

# Reverse only the real aerial pull-away, turning it into an approach. No synthesized frames.
# Scale before reversing to keep memory bounded. Each output is silent, H.264, fast-start.
clips=[('arrival',40,10,True),('pool',16,3.5,False),('gazebo',22,3.5,False)]
selected = argparse.ArgumentParser(); selected.add_argument('--clips',nargs='*'); options=selected.parse_args()
for name,start,duration,reverse in clips:
    if options.clips is not None and name not in options.clips: continue
    for width,crf in [(1440,25),(720,27)]:
        filters=f'scale={width}:-2,fps=24'+(',reverse' if reverse else '')
        rate='1800k' if width==1440 else '650k'
        buffer='3600k' if width==1440 else '1300k'
        run(['-ss',start,'-t',duration,'-i',video,'-vf',filters,'-an','-c:v','libx264','-preset','medium','-crf',crf+2,'-maxrate',rate,'-bufsize',buffer,'-pix_fmt','yuv420p','-g','48','-movflags','+faststart',assets/f'{name}-{width}.mp4'])
        run(['-i',assets/f'{name}-{width}.mp4','-frames:v','1','-q:v','3',assets/f'{name}-poster-{width}.jpg'])
manifest={'original':video.name,'originalBytes':video.stat().st_size,'sourcePhotoMap':mapping,'clips':[{'name':n,'sourceStart':s,'seconds':d,'reversed':r} for n,s,d,r in clips],'entrance':'AI morning lighting edit of IMG_9781.jpeg; original retained in source-reference. No daytime footage exists for entrance.','files':{p.name:p.stat().st_size for p in sorted(assets.iterdir()) if p.is_file()}}
(root/'ASSET-MANIFEST.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps({'assetBytes':sum(manifest['files'].values()),'files':manifest['files']},indent=2))
