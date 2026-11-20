import os, re
d = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(d, 'src')
# src/manifest.txt lists every source file in load order (engine → entities → models → world → game → missions → boot)
order = [l.strip() for l in open(os.path.join(src, 'manifest.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
missing = [f for f in order if not os.path.exists(os.path.join(src, f))]
if missing: raise SystemExit('missing source files: ' + ', '.join(missing))
listed = set(order)
stray = [os.path.relpath(os.path.join(r, f), src) for r, _, fs in os.walk(src) for f in fs if f.endswith('.js') and os.path.relpath(os.path.join(r, f), src) not in listed]
if stray: print('warning: .js files not in manifest.txt (not built):', ', '.join(sorted(stray)))
js = '\n'.join(open(os.path.join(src, f), encoding='utf-8').read() for f in order)
# three.js addons (post-processing, rounded boxes) inlined: each file becomes an IIFE whose exports land in module scope
ADD = ['shaders/CopyShader.js', 'postprocessing/Pass.js', 'postprocessing/ShaderPass.js', 'postprocessing/MaskPass.js', 'postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js',
       'shaders/GTAOShader.js', 'shaders/PoissonDenoiseShader.js', 'math/SimplexNoise.js', 'postprocessing/GTAOPass.js', 'shaders/LuminosityHighPassShader.js', 'postprocessing/UnrealBloomPass.js',
       'shaders/OutputShader.js', 'postprocessing/OutputPass.js', 'shaders/FXAAShader.js', 'geometries/RoundedBoxGeometry.js']
jsm = os.path.join(d, 'node_modules', 'three', 'examples', 'jsm')
def addon(rel):
    t = open(os.path.join(jsm, rel), encoding='utf-8').read()
    names = []
    for m in re.finditer(r'^export\s*\{([^}]*)\};?\s*$', t, re.M): names += [n.strip() for n in m.group(1).split(',') if n.strip()]
    t = re.sub(r'^export\s*\{[^}]*\};?\s*$', '', t, flags=re.M)
    for m in re.finditer(r'^export\s+(?:const|class|function|let)\s+(\w+)', t, re.M): names.append(m.group(1))
    t = re.sub(r'^export\s+(?=(const|class|function|let)\s)', '', t, flags=re.M)
    def imp(m):
        what, frm = m.group(1), m.group(2)
        return ('const {' + what + '} = THREE;') if frm == 'three' else ''
    t = re.sub(r'^import\s*\{([^}]*)\}\s*from\s*[\'"]([^\'"]+)[\'"];?', imp, t, flags=re.M | re.S)
    return 'const { %s } = (() => {\n%s\nreturn { %s };\n})();\n' % (', '.join(names), t, ', '.join(names))
addons = '\n'.join(addon(r) for r in ADD)
nl = js.index('\n')
js = js[:nl + 1] + addons + js[nl + 1:]
# syntax check before writing anything: a stray comment or bracket would otherwise ship a game that never starts
import subprocess, tempfile, shutil
if shutil.which('node'):
    with tempfile.NamedTemporaryFile('w', suffix='.mjs', delete=False, encoding='utf-8') as tf: tf.write(js); tmp = tf.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True); os.unlink(tmp)
    if r.returncode != 0:
        err = r.stderr.replace(tmp, 'WW3.js'); m = re.search(r'WW3\.js:(\d+)', err)
        if m:  # map the joined line back to its source file
            ln = int(m.group(1)) - addons.count('\n') - 1; acc = 0
            for f in order:
                n = open(os.path.join(src, f), encoding='utf-8').read().count('\n') + 1
                if acc + n >= ln: err += '\n→ src/%s:%d' % (f, ln - acc); break
                acc += n
        raise SystemExit('syntax error, nothing written:\n' + err)
else: print('warning: node not found, syntax check skipped')
shell = open(os.path.join(src, 'shell.html'), encoding='utf-8').read()
i = shell.index('<canvas id="game">')
head, body = shell[:i], shell[i:]
script = '<script type="module">\n' + js + '\n</script>\n'
os.makedirs(os.path.join(d, 'dist'), exist_ok=True)
# artifact version (skeleton supplied by host)
open(os.path.join(d, 'dist', 'artifact.html'), 'w', encoding='utf-8').write(shell + '\n' + script)
# standalone single file
full = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + head + '</head>\n<body>\n' + body + '\n' + script + '</body>\n</html>\n')
open(os.path.join(d, 'dist', 'WW3.html'), 'w', encoding='utf-8').write(full)
open(os.path.join(d, 'dist', 'index.html'), 'w', encoding='utf-8').write(full)  # the site root (Cloudflare serves index.html)
print(len(full), 'bytes', js.count('\n'), 'js lines')

# the graphics sample: same game, boots into the 한강대로 1:1 chooser
smp = '<script>window.__SAMPLE = 1;</script>\n'
open(os.path.join(d, 'dist', 'sample_artifact.html'), 'w', encoding='utf-8').write('<title>WW3 한강대로 샘플</title>\n' + shell + '\n' + smp + script)
open(os.path.join(d, 'dist', 'sample.html'), 'w', encoding='utf-8').write(full.replace('<script type="module">', smp + '<script type="module">', 1))
