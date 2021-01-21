import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { processStr } from 'solhint'
import recommendedRules from './recommended-rules'

require('file-loader?name=[name].[ext]!./index.html');

const log = (...args) => console.log('[Solhint]', ...args)

const solhintReportsContainer = document.querySelector('#solhint-reports')

class SolhintPlugin extends PluginClient {
  constructor() {
    super()
  }
}

log('about to start')

const client = createClient(new SolhintPlugin())

require.ensure([], () => {
  client.onload(main)
})

function main() {
  log('running!')

  const severityColorMap = {
    2: '#E74C3C',
    3: '#F39C12'
  }

  client.solidity.on('compilationFinished', async (filename) => {
    log(`${filename} compiled`)

    const file = await client.fileManager.getFile(filename)

    const reporter = processStr(file, {
      rules: {
        ...recommendedRules
      }
    })

    if (reporter.reports.length === 0) {
      log('No reports')
      client.emit('statusChanged', { key: 'succeed', type: 'success', title: 'SOLHINT no errors found' })
    } else {
      log(`${reporter.reports.length} problems found`)
      client.emit('statusChanged', { key: reporter.reports.length, type: 'error', title: 'SOLHINT errors found' })
    }

    await client.editor.discardHighlight()

    reporter.reports.forEach((report) => {
      client.editor.highlight({
        start: {
          line: report.line - 1,
          column: report.column - 1
        },
        end: {
          line: report.line - 1,
          column: report.column
        }
      }, filename, severityColorMap[report.severity])
    })

    solhintReportsContainer.innerHTML = ''
    if (reporter.reports.length) {
      reporter.reports.forEach(report => reportMessage(report, filename))
    } else {
      solhintReportsContainer.innerHTML = 'No errors found'
    }
  })
}

// TODO, remove this and use yo-yo to build report instead
// https://github.com/ethereum/remix-ide/blob/1fe0ede5dee871760006f165733d7885fb235fc5/best-practices.md
function reportMessage(report, filename) {
  const typeOfReport = {
    2: 'danger',
    3: 'warning'
  }
  const messageType = { '2': 'Error', '3': 'Warning' }
  const htmlReport = document.createElement('div')
  const text = new Text(`${filename}:${report.line}:${report.column}: ${messageType[report.severity]}: ${report.message}`)

  htmlReport.classList.add(`sol`)
  htmlReport.classList.add(`${typeOfReport[report.severity]}`)
  htmlReport.classList.add(`alert`)
  htmlReport.classList.add(`alert-${typeOfReport[report.severity]}`)
  const pre = document.createElement('pre')
  pre.style.whiteSpace = 'break-spaces'
  htmlReport
    .appendChild(pre)
    .appendChild(document.createElement('span'))
    .append(text)

  solhintReportsContainer.appendChild(htmlReport)
}
