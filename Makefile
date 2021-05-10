build:
	npx hardhat compile
.PHONY: build

lint:
	yarn lint
.PHONY: lint

test:
	npx hardhat test
.PHONY: test
