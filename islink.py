import os
import ctypes.wintypes

FILE_ATTRIBUTE_REPARSE_POINT = 0x400
INVALID_FILE_ATTRIBUTES = 0xFFFFFFFF
IO_REPARSE_TAG_SYMLINK = 0xA000000C
GetFileAttributes = ctypes.windll.kernel32.GetFileAttributesW


def _patch_path(path):
    if path.startswith('\\\\?\\'):
        return path
    abs_path = os.path.abspath(path)
    if not abs_path[1] == ':':
        abs_path = os.getcwd()[:2] + abs_path
    return '\\\\?\\' + abs_path


def _is_symlink(find_data):
    return find_data.reserved[0] == IO_REPARSE_TAG_SYMLINK


def is_symlink(path):
    path = _patch_path(path)
    try:
        return _is_symlink(next(find_files(path)))
    except WindowsError as orig_error:
        tmpl = "Error accessing {path}: {orig_error.message}"
        raise builtins.WindowsError(lf(tmpl))


def is_reparse_point(path):
    res = GetFileAttributes(path)
    return (
        res != INVALID_FILE_ATTRIBUTES
        and bool(res & FILE_ATTRIBUTE_REPARSE_POINT)
    )


def find_files(spec):
    fd = api.WIN32_FIND_DATA()
    handle = api.FindFirstFile(spec, byref(fd))
    while True:
        if handle == api.INVALID_HANDLE_VALUE:
            raise WindowsError()
        yield fd
        fd = api.WIN32_FIND_DATA()
        res = api.FindNextFile(handle, byref(fd))
        if res == 0:  # error
            error = WindowsError()
            if error.code == api.ERROR_NO_MORE_FILES:
                break
            else:
                raise error
    # todo: how to close handle when generator is destroyed?
    # hint: catch GeneratorExit
    windll.kernel32.FindClose(handle)


def islink(path):
    # borrowed from jaraco
    return is_reparse_point(path) and is_symlink(path)

print(islink('islink.py'))
