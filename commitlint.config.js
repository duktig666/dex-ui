module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（不新增功能或修复 bug）
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建工具或辅助工具变动
        'revert', // 回滚
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置变更
      ],
    ],
    // 允许中文 subject
    'subject-case': [0],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
  },
};
