testui:
	@npm run test:ui

test:
	@npm run test:run

build:
	@npm run build

publish: 
	@npm publish --access public

specdl:
	@echo "Downloading OpenAPI spec..."
	@curl http://0.0.0.0:8888/sdk/spec.yaml > openapi.yaml
	# @curl https://api.modelmetry.com/sdk/spec.yaml > openapi.yaml

specgen: specdl
	@echo "Generating OpenAPI types..."
	@npm run openapi:gen
