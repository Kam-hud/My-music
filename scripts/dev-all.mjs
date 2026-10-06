/**
 * 一键启动脚本：同时拉起 Node 代理服务（3001）与 Vite 前端（5173）。
 * 用法：npm run dev
 * 说明：不引入 concurrently 等额外依赖，直接用 node:child_process 托管两个子进程。
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const isWin = process.platform === 'win32'
const npmCmd = isWin ? 'npm.cmd' : 'npm'

const children = []

function run(name, command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin // Windows 下需要 shell 才能解析 npm.cmd / node
  })
  child.on('exit', (code) => {
    console.log(`\n[dev-all] ${name} 已退出（code=${code}），正在关闭另一个进程...`)
    shutdown()
  })
  children.push(child)
  return child
}

function shutdown() {
  for (const c of children) {
    if (!c.killed) {
      try {
        c.kill()
      } catch (e) {
        /* 忽略关闭失败 */
      }
    }
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log('[dev-all] 启动 Node 代理服务 http://localhost:3001 ...')
run('server', npmCmd, ['run', 'server'])

console.log('[dev-all] 启动 Vite 前端开发服务 ...')
run('web', npmCmd, ['run', 'dev:web'])
