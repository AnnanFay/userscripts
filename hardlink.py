import os
from glob import glob
from subprocess import check_output, CalledProcessError, PIPE

source_dir = 'F:/Dropbox/GitHub/userscripts'
# target_dir = 'F:/3djnbzys.default/gm_scripts'
target_dir = 'C:/Users/sai/AppData/Roaming/Mozilla/Firefox/Profiles/e3pdxpt8.GCDev/gm_scripts'

DRY_RUN = True


def islink(filename):
    command = ['dir', filename.replace('/', '\\')]

    try:
        output = check_output(command, shell=True)  # , stderr=PIPE)
    except CalledProcessError as e:
        return False

    output = [s.strip() for s in output.split('\n')]
    if len(output) < 6:
        return False
    else:
        return 'SYMLINK' in output[5]


def rglob(path, pattern):
    return [y for x in os.walk(path)
            for y in glob(os.path.join(x[0], pattern)) if not islink(y)]


def index_source(directory):
    found = rglob(directory, '*.user.js')
    return found


def index_target(directory):
    found = rglob(directory, '*.user.js')
    return found


def backup(full_path, filename, target_dir):
    i = 0
    while True:
        new_path = os.path.join(
            target_dir, '%s-%s.backup' % (filename, i))
        i += 1
        if not os.path.exists(new_path):
            break
    print 'backup\t', full_path, '\n\t\t',  new_path

    if DRY_RUN:
        return

    os.rename(full_path, new_path)


def mklink(target, link_created):
    os.system('mklink "%s" "%s"' % (link_created, target))


def link_source_to_target(source, target):
    print 'f-copy\t', source, '\n\t\t',  target

    if DRY_RUN:
        return

    if os.path.exists(target):
        raise Exception('Existing file!!!')

    mklink(source, target)


def main():
    source_index = index_source(source_dir)
    target_index = index_target(target_dir)

    print 'source_index count', len(source_index)
    print 'target_index count', len(target_index)

    for target in target_index:
        target_full_dir, target_filename = os.path.split(target)
        target_dirname = os.path.split(target_full_dir)[-1]
        for source in source_index:
            source_full_dir, source_filename = os.path.split(source)
            source_dirname = os.path.split(source_full_dir)[-1]
            if source_dirname == target_dirname and source_filename == target_filename:
                print 'match'
                print '\t', source
                print '\t', target
                backup(target, target_filename, source_full_dir)
                link_source_to_target(source, target)

main()
input("Press Enter to continue...")
