---
category: Components
type: Data Display
title: Anchor
subtitle: 锚点
---

当页面需要锚点的导航，反映当前页面位置，可以通过锚点导航快速在各个锚点之间跳转。

### 规则
- 每个锚点区域需要声明id，并在list中将id传入anchor中
- list中的每个对象的数据，会作为renderItem的props透传

## API
属性 | 说明 | 类型 | 默认值
----|-----|------|------
| affix | 是否吸顶 | boolean | true |
| bounds | 锚点区域边界 | number | 0 |
| getContainer | 指定滚动的容器 | () => HTMLElement | () => window |
| getCurrentAnchor | 自定义高亮的锚点，返回高亮锚点的id | () => string |
| offsetTop | 距离窗口顶部达到指定偏移量后触发 | number | 0 |
| onChange | 监听锚点链接改变 | (currentActiveLink: string) => void | - |
| onClick | `click` 事件的 handler | function(link: string) | - |

