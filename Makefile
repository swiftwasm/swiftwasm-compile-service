MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
WABT_DIR := $(MAKEFILE_DIR)/prebuilt/wabt
SWIFT_DIR := $(MAKEFILE_DIR)/prebuilt/swift

ifeq  ($(shell uname),Darwin)
WABT_DOWNLOAD_URL="https://github.com/WebAssembly/wabt/releases/download/1.0.12/wabt-1.0.12-osx.tar.gz"
SWIFT_TOOLCHAIN_DOWNLOAD_URL="https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a-osx.tar.gz"
else ifeq ($(shell uname),Linux)
WABT_DOWNLOAD_URL="https://github.com/WebAssembly/wabt/releases/download/1.0.12/wabt-1.0.12-linux.tar.gz"
SWIFT_TOOLCHAIN_DOWNLOAD_URL="https://github.com/swiftwasm/swift/releases/download/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a/swift-wasm-DEVELOPMENT-SNAPSHOT-2020-04-06-a-linux.tar.gz"
endif

prebuilt/wabt:
	mkdir -p $(WABT_DIR) && cd $(WABT_DIR) && \
		curl -L $(WABT_DOWNLOAD_URL) | tar xz --strip-components 1
	./utils/remove-wabt-extra-files.sh
prebuilt/swift:
	mkdir -p $(SWIFT_DIR) && cd $(SWIFT_DIR) && \
		curl -L $(SWIFT_TOOLCHAIN_DOWNLOAD_URL) | tar xz --strip-components 1
	./utils/remove-swift-extra-files.sh

FirebaseFunction/functions/compiler: prebuilt/swift prebuilt/wabt
	mkdir -p $@
	cp -a $^ $@
FirebaseFunction/functions/service.js: service.js
	cp $< $@