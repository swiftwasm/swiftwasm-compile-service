SWIFT_LINUX_TOOLCHAIN_DOWNLOAD_URL="https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a-linux.tar.gz"
ifeq  ($(shell uname),Darwin)
WABT_DOWNLOAD_URL="https://github.com/WebAssembly/wabt/releases/download/1.0.12/wabt-1.0.12-osx.tar.gz"
SWIFT_TOOLCHAIN_DOWNLOAD_URL="https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a-osx.tar.gz"
else ifeq ($(shell uname),Linux)
WABT_DOWNLOAD_URL="https://github.com/WebAssembly/wabt/releases/download/1.0.12/wabt-1.0.12-linux.tar.gz"
SWIFT_TOOLCHAIN_DOWNLOAD_URL=$(SWIFT_LINUX_TOOLCHAIN_DOWNLOAD_URL)
endif

LIBATOMIC_DOWNLOAD_URL="http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic/libatomic1-9.2.1-alt3.x86_64.rpm"

prebuilt/wabt:
	mkdir -p $@ && cd $@ && \
		curl -L $(WABT_DOWNLOAD_URL) | tar xz --strip-components 1
	./utils/remove-wabt-extra-files.sh
prebuilt/swift:
	mkdir -p $@ && cd $@ && \
		curl -L $(SWIFT_TOOLCHAIN_DOWNLOAD_URL) | tar xz --strip-components 1
	./utils/remove-swift-extra-files.sh
prebuilt/linux/swift: prebuilt/swift
ifeq ($(shell uname),Linux)
	cp -a prebuilt/swift prebuilt/linux/swift
else
	mkdir -p $@ && cd $@ && \
		curl -L $(SWIFT_LINUX_TOOLCHAIN_DOWNLOAD_URL) | tar xz --strip-components 1
	./utils/remove-swift-extra-files.sh
endif
prebuilt/libatomic.so.1:
	./utils/download-libatomic.sh $(LIBATOMIC_DOWNLOAD_URL)

FirebaseFunction/functions/prebuilt: prebuilt/linux/swift prebuilt/wabt
	mkdir -p $@
	cp -af $^ $@
FirebaseFunction/functions/service.js: service.js
	cp $< $@
FirebaseFunction/functions/extralib: prebuilt/libatomic.so.1
	mkdir -p $@
	cp prebuilt/libatomic.so.1 $@/libatomic.so.1

.PHONY: deploy
deploy: FirebaseFunction/functions/service.js FirebaseFunction/functions/prebuilt FirebaseFunction/functions/extralib