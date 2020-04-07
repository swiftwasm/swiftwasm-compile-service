LIBATOMIC_DOWNLOAD_URL=$1
SOURCE="$(cd "$(dirname $0)/.." && pwd)"

TMP_DIR=$(mktemp -d)
cd $TMP_DIR
curl -L $LIBATOMIC_DOWNLOAD_URL | rpm2cpio | cpio -id
cp -f $TMP_DIR/usr/lib64/libatomic.so.1 $SOURCE/prebuilt/libatomic.so.1