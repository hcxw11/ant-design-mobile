---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

```jsx
import { Anchor } from 'antd-mobile';

const list = [
  {
    id: 'anchor1',
    title: '锚点1',
  },
  {
    id: 'anchor2',
    title: '锚点2',
  },
  {
    id: 'anchor3',
    title: '锚点3',
  },
];

const anchorAreaStyle = { height: '400px' };

const AnchorExample = () => (
  <div>
    <div style={anchorAreaStyle}>其他占位区域</div>
    <div>
      <Anchor
        list={list}
        offsetTop={36}
        onClick={(config) => {
          console.log(config);
        }}
        onChange={(config) => {
          console.log(config);
        }}
        // renderItem={({ id, title }) => <div key={id}>{title}</div>}
      />
      {list.map(({ id, title }) => (
        <div id={id} key={id} style={anchorAreaStyle}>
          {title}
        </div>
      ))}
    </div>
    <div style={anchorAreaStyle}>其他占位区域</div>
  </div>
);
ReactDOM.render(<AnchorExample />, mountNode);
```
