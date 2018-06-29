#! /usr/bin/env node

const chalk = require('chalk')
const semver = require('semver')

const requiredVersion = require('../package.json').engines.node

//版本检测
if (!semver.satisfies(process.version, requiredVersion)) {
    console.log(chalk.red(
        `\nminimum Node version not met:` +
        `\nYou are using Node ${process.version}, but woolPress ` +
        `requires Node ${requiredVersion}.\nPlease upgrade your Node version.\n`
    ))
    process.exit(1)
}

const path = require('path')
const program = require('commander')

//传入版本
program
    .version(require('../package.json').version)
    .usage('<command> [options]')

//定义dev指令
program
    .command('dev')
    .description('start development server')

//定义build指令
program
    .command('build')
    .description('build dir as static site')

//错误指令输出帮助信息
program
    .arguments('<command>')
    .action((cmd) => {
        if (cmd !== 'dev' && cmd !== 'build') {
            program.outputHelp()
            console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
            console.log()
        }
    })

//在默认help后补充信息
program.on('--help', () => {
    console.log()
    console.log(`${chalk.cyan(`Welcome to woolPress.`)}`)
    console.log()
})

//未输入选项输出帮助
if (!process.argv.slice(2).length) {
    program.outputHelp()
}

//修改unknownOption方法，输入错误选项输出
const enhanceErrorMessages = (methodName, log) => {
    program.Command.prototype[methodName] = function (...args) {
        if (methodName === 'unknownOption' && this._allowUnknownOption) {
            return
        }
        this.outputHelp()
        console.log(`  ` + chalk.red(log(...args)))
        console.log()
        process.exit(1)
    }
}

enhanceErrorMessages('unknownOption', optionName => {
    return `Unknown option ${chalk.yellow(optionName)}.`
})

program.parse(process.argv);