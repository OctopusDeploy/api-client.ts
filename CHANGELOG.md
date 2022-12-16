# Changelog

## [2.1.2](https://github.com/OctopusDeploy/api-client.ts/compare/v2.1.1...v2.1.2) (2022-12-16)


### Bug Fixes

* ensure errors for failed package push are raised ([8a96573](https://github.com/OctopusDeploy/api-client.ts/commit/8a9657347ec4a8af855112e4fb839c25e7859210))

## [2.1.1](https://github.com/OctopusDeploy/api-client.ts/compare/v2.1.0...v2.1.1) (2022-12-12)


### Bug Fixes

* Fixed a bug with nested directory handling in the zip utilities ([f3bf147](https://github.com/OctopusDeploy/api-client.ts/commit/f3bf14747723ad806133e473abc58315f10660e2))

## [2.1.0](https://github.com/OctopusDeploy/api-client.ts/compare/v2.0.0...v2.1.0) (2022-12-09)


### Features

* Add support for creating Zip and NuGet packages ([#128](https://github.com/OctopusDeploy/api-client.ts/issues/128)) ([804e2e7](https://github.com/OctopusDeploy/api-client.ts/commit/804e2e7fd633a1c5649873460bd22e59ed461ebb))


### Bug Fixes

* Fixed an issue with error handling in task waiter ([#127](https://github.com/OctopusDeploy/api-client.ts/issues/127)) ([7e2ec6e](https://github.com/OctopusDeploy/api-client.ts/commit/7e2ec6eb94153b576cd1e76d01931a4881cdb91b))

## [2.0.0](https://github.com/OctopusDeploy/api-client.ts/compare/v1.4.0...v2.0.0) (2022-12-05)


### ⚠ BREAKING CHANGES

* Removed environment variables from client, it is callers responsibility. Removed monolithic repositoy object and added space awareness to individual repository implementations
* Updates to call the create release/executions APIs ([#123](https://github.com/OctopusDeploy/api-client.ts/issues/123))

### Features

* Removed environment variables from client, it is callers responsibility. Removed monolithic repositoy object and added space awareness to individual repository implementations ([86e86e1](https://github.com/OctopusDeploy/api-client.ts/commit/86e86e19e7c1a44d54b994e497055658c2bf33a1))
* Updates to call the create release/executions APIs ([#123](https://github.com/OctopusDeploy/api-client.ts/issues/123)) ([03eddec](https://github.com/OctopusDeploy/api-client.ts/commit/03eddece5e674c5a16b33765e9e4342d5602bf08))

## [1.4.0](https://github.com/OctopusDeploy/api-client.ts/compare/v1.3.2...v1.4.0) (2022-07-21)


### Features

* Allow the environment variable for space to be an Id or a Name ([#102](https://github.com/OctopusDeploy/api-client.ts/issues/102)) ([aa67ae5](https://github.com/OctopusDeploy/api-client.ts/commit/aa67ae5eb52de611e8f7e4b5d5e2707ee11ef407))

## [1.3.2](https://github.com/OctopusDeploy/api-client.ts/compare/v1.3.1...v1.3.2) (2022-07-19)


### Bug Fixes

* update how we import fs.promises ([9eaf40e](https://github.com/OctopusDeploy/api-client.ts/commit/9eaf40ed8e0ce1fb67904c750ee07d6588ea7c66))

## [1.3.1](https://github.com/OctopusDeploy/api-client.ts/compare/v1.3.0...v1.3.1) (2022-07-17)


### Bug Fixes

* updated client auto-connect ([1b72b0e](https://github.com/OctopusDeploy/api-client.ts/commit/1b72b0e57cebf92b24b72ecc03f59d077482ff8c))

## [1.3.0](https://github.com/OctopusDeploy/api-client.ts/compare/v1.2.1...v1.3.0) (2022-07-01)


### Features

* added index files for typescript type exports ([#71](https://github.com/OctopusDeploy/api-client.ts/issues/71)) ([b86d262](https://github.com/OctopusDeploy/api-client.ts/commit/b86d262510e74701a7eb130a660f353252eb4938))

## [1.2.1](https://github.com/OctopusDeploy/api-client.ts/compare/v1.1.7...v1.2.1) (2022-06-27)


### Features

* added configuration processor, moved code ([aa5d971](https://github.com/OctopusDeploy/api-client.ts/commit/aa5d97195a9c88830ec2c68aed9cc93a4666f363))
* added environment variables constants ([44cc7b2](https://github.com/OctopusDeploy/api-client.ts/commit/44cc7b2748111f529605010303dd0e4beb23fb61))
* reflected changes to message contracts ([1c72122](https://github.com/OctopusDeploy/api-client.ts/commit/1c72122ec3002d2a2a90fd4e65dd587dcc60d74c))
* replaced random name with UUIDs for uniqueness ([ff154a8](https://github.com/OctopusDeploy/api-client.ts/commit/ff154a88c33a4d80150f0aae11988e9d4cc771c3))
* updated client ([1800da9](https://github.com/OctopusDeploy/api-client.ts/commit/1800da9dc39ab24006ec7d04e0368217fbc7a1ca))
* updated DeploymentOptions with stronger typing ([c16e070](https://github.com/OctopusDeploy/api-client.ts/commit/c16e0701a1c184520f21e91143d6857b577f755a))
* updated stronger typing ([986880e](https://github.com/OctopusDeploy/api-client.ts/commit/986880ecf0d678f6914c29f3a6722d160467e558))
* updated to strong typing enforcement ([7f902bd](https://github.com/OctopusDeploy/api-client.ts/commit/7f902bdf61f16445963f8033d85a4a0e977ce42f))
* updated to stronger typing ([eb83e52](https://github.com/OctopusDeploy/api-client.ts/commit/eb83e5285955dacac371837d8aa04638ecfa9d74))
* updated to stronger typing enforcement ([2c57b5c](https://github.com/OctopusDeploy/api-client.ts/commit/2c57b5cfbeb2c1dbf4eaee189a17f2ae977b9712))
* updated typing for deploy release ([ce857a9](https://github.com/OctopusDeploy/api-client.ts/commit/ce857a9ed2241196fff701b0f56ac53b61f7f249))


### Bug Fixes

* updated error handling ([375a0e2](https://github.com/OctopusDeploy/api-client.ts/commit/375a0e296328caf563d1491e0ab1f45dc7c90f41))
* updated publish workflow ([274521a](https://github.com/OctopusDeploy/api-client.ts/commit/274521a4ef2fb9582327a0ce7ee026248c6c386a))
* updated space name ([545fe58](https://github.com/OctopusDeploy/api-client.ts/commit/545fe58b89390701e90fc90f404be3c980b505e8))


### Miscellaneous Chores

* release 1.2.0 ([813c372](https://github.com/OctopusDeploy/api-client.ts/commit/813c3726e2dc846533b73d9731cfcf0782fc9773))
* release 1.2.1 ([332017b](https://github.com/OctopusDeploy/api-client.ts/commit/332017bc73798669562b4faafcee388269784666))

### [1.1.7](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.6...v1.1.7) (2021-12-02)


### Features

* **adapter:** Created axios adapter to replace ky and  got adapters ([e3b31bd](https://www.github.com/OctopusDeploy/api-client.ts/commit/e3b31bdbd97f8eee29c63fde078f59127ff8e30c))


### Miscellaneous Chores

* release 1.1.7 ([2c03c84](https://www.github.com/OctopusDeploy/api-client.ts/commit/2c03c844fb8d23dcadd116a6b9f8cb4d3cffbb2b))

### [1.1.6](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.5...v1.1.6) (2021-12-01)


### Features

* **repository:** Exposed client in Repository to match C# client and improve developer experience ([7611f2d](https://www.github.com/OctopusDeploy/api-client.ts/commit/7611f2db88becacb93039b4089a9b8e65074bc69))


### Miscellaneous Chores

* release 1.1.6 ([63526b7](https://www.github.com/OctopusDeploy/api-client.ts/commit/63526b79a537e8be40ad2c57f981925f7e74977e))

### [1.1.5](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.4...v1.1.5) (2021-12-01)


### Features

* added documentation ([9462cb8](https://www.github.com/OctopusDeploy/api-client.ts/commit/9462cb88f3fcef60454e928a6d5cbf7d0f6eb388))
* **apiClient:** browser support ([1ae4004](https://www.github.com/OctopusDeploy/api-client.ts/commit/1ae40049df16062228e5e86e20f2dfaeb8f7cb0f))


### Miscellaneous Chores

* release 1.1.5 ([ab538c0](https://www.github.com/OctopusDeploy/api-client.ts/commit/ab538c06dd54d7ab2a8500f22668f7141b60065f))

### [1.1.4](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.3...v1.1.4) (2021-11-25)


### Bug Fixes

* **core:** adjusted dependencies ([0a1b0c6](https://www.github.com/OctopusDeploy/api-client.ts/commit/0a1b0c663354b34db6521f2d8932c3b628cd2777))

### [1.1.3](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.2...v1.1.3) (2021-11-25)


### Features

* **examples:** added example for create and deploy release ([30b82b1](https://www.github.com/OctopusDeploy/api-client.ts/commit/30b82b15ad876b2e0b683f9098c1d231ff8bca1e))
* **examples:** added example for projects ([418aa95](https://www.github.com/OctopusDeploy/api-client.ts/commit/418aa95672cbb2b01242300a4a2309c0edc4f62c))
* **examples:** added examples for accounts ([55b3512](https://www.github.com/OctopusDeploy/api-client.ts/commit/55b351248a4070ae025d92c3b3fc4799f74abd4a))
* **examples:** added runbook example ([b107045](https://www.github.com/OctopusDeploy/api-client.ts/commit/b1070450af5fd5c9aefbec00e09480782fe4c85e))


### Bug Fixes

* **apiClient:** output error to console upon failed connection ([f2bcaf2](https://www.github.com/OctopusDeploy/api-client.ts/commit/f2bcaf2c007960d86451da7e59b0de9663e0c6ea))


### Miscellaneous Chores

* release 1.1.3 ([6aa4030](https://www.github.com/OctopusDeploy/api-client.ts/commit/6aa4030450a5b4b71490ee4f40ec561a339b14f0))

### [1.1.2](https://www.github.com/OctopusDeploy/api-client.ts/compare/v1.1.1...v1.1.2) (2021-11-24)


### Miscellaneous Chores

* release 1.1.2 ([7f53f59](https://www.github.com/OctopusDeploy/api-client.ts/commit/7f53f59380c145d941763929837cfd545b8a3d6e))

### 1.1.1 (2021-11-24)


### Features

* added agent to client configuration ([08be596](https://www.github.com/OctopusDeploy/api-client.ts/commit/08be59670e1a4e549a9990088975ad9950e0b64d))
* added files attribute ([147088b](https://www.github.com/OctopusDeploy/api-client.ts/commit/147088b9018d50b2969f34a4e9394534af46294d))
* added find search function to channel repository ([7ad89fc](https://www.github.com/OctopusDeploy/api-client.ts/commit/7ad89fcddc1ce729cd23d19cd67a0dd31997ac68))
* added license ([9dabdee](https://www.github.com/OctopusDeploy/api-client.ts/commit/9dabdee1e8aba6f3a379d6fa6fe574ca25d1f5ef))
* added semver support ([33ac317](https://www.github.com/OctopusDeploy/api-client.ts/commit/33ac317ae151c798ea6b01697ff8c36e682d0011))
* added usage section ([0656601](https://www.github.com/OctopusDeploy/api-client.ts/commit/0656601d7670dedcf4d2515b1514bd0ee8a90e26))
* **deployment processes:** updated repository for new use ([9ed5257](https://www.github.com/OctopusDeploy/api-client.ts/commit/9ed525758468f4fca233752ee9ffa9dc2366f6ee))
* **deployments:** updated repository for new usage ([ef4a337](https://www.github.com/OctopusDeploy/api-client.ts/commit/ef4a3379b93f2e1d4ad52f67242a94cd3e2c1324))
* **repository:** added new deployment processes repository ([eb712ab](https://www.github.com/OctopusDeploy/api-client.ts/commit/eb712ab07d1de9c8ddb86e748d99a81596cf8100))
* used NewReleaseResource type for add operations ([6ab4cd0](https://www.github.com/OctopusDeploy/api-client.ts/commit/6ab4cd0db82b2d5b2f8234d86df789c4cbe0388d))
* working version of API client ([cac9386](https://www.github.com/OctopusDeploy/api-client.ts/commit/cac93860e919b97d7fd8b6b6352168c5c581dcc7))


### Bug Fixes

* added imports ([e095066](https://www.github.com/OctopusDeploy/api-client.ts/commit/e095066861f8320d1550b400dd76002da408d881))
* removed incomplete method definition ([acb6e0e](https://www.github.com/OctopusDeploy/api-client.ts/commit/acb6e0e7f063b60b494bff43d43f6bea306c5843))


### Miscellaneous Chores

* release 1.1.1 ([d8b007a](https://www.github.com/OctopusDeploy/api-client.ts/commit/d8b007a7ad94efdcf0e0d51edaf61cb311f0362d))
