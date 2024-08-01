testui:
	@npm run test:ui

test:
	@npm run test:run

build: test
	@npm run build

specdl:
	@echo "Downloading OpenAPI spec..."
	@curl http://0.0.0.0:8888/sdk/spec.yaml > openapi.yaml
	# @curl https://api.modelmetry.com/sdk/spec.yaml > openapi.yaml

specgen:
	@echo "Generating OpenAPI types..."
	@npm run openapi:gen
