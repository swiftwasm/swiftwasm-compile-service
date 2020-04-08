LIBATOMIC_DOWNLOAD_URL=$1
SOURCE="$(cd "$(dirname $0)/.." && pwd)"

set -x
TMP_DIR=$(mktemp -d)
cd $TMP_DIR
curl -L $LIBATOMIC_DOWNLOAD_URL | rpm2cpio | cpio -id
cp -f $TMP_DIR/usr/lib64/libstdc++.so.6 $SOURCE/prebuilt/libstdc++.so.6
