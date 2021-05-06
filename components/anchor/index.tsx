import * as React from "react";
// @ts-ignore
import addEventListener from "rc-util/lib/Dom/addEventListener";
import getScroll, { isWindow } from "./getScroll";
import Affix from "./affix";
import classnames from "classnames";
import { default as _scrollTo } from "./scrollTo";

export type AnchorContainer = HTMLElement | Window;

type AnchorConfig = {
  id: string;
};

type ItemRenderProps = AnchorConfig & { active: boolean };

interface Props {
  list: AnchorConfig[];
  offsetTop: number;
  bounds: number;
  style: React.CSSProperties;
  onChange?: (currentActiveLink: string) => void;
  getContainer?: () => AnchorContainer;
  getCurrentAnchor?: () => string;
  renderItem: ((props: ItemRenderProps) => JSX.Element) | JSX.Element;
}

interface State {
  activeLink: null | string;
}

type Section = {
  link: string;
  top: number;
};

type ScrollOption = {
  container?: AnchorContainer;
  offsetTop?: number;
};

function getOffsetTop(
  element: HTMLElement,
  container: AnchorContainer,
): number {
  if (!element.getClientRects().length) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (isWindow(container)) {
      container = element.ownerDocument!.documentElement!;
      return rect.top - container.clientTop;
    }
    return rect.top - container.getBoundingClientRect().top;
  }

  return rect.top;
}

function getDefaultContainer() {
  return window;
}

function defaultRenderItem({ id, active }: ItemRenderProps) {
  return (
    <div key={id} className={classnames("anchor-item", { active })}>
      {id}
    </div>
  );
}

export async function scrollTo(
  id: string,
  { container = window, offsetTop }: ScrollOption = {},
) {
  return new Promise<void>((resolve) => {
    const scrollTop = getScroll(container, true);

    const targetElement = document.getElementById(id);
    if (!targetElement) {
      return;
    }

    const eleOffsetTop = getOffsetTop(targetElement, container);
    let y = scrollTop + eleOffsetTop;
    y -= offsetTop || 0;

    _scrollTo(y, {
      callback: resolve,
      getContainer: () => container,
    });
  });
}

class Anchor extends React.Component<Props, State> {
  state = {
    links: [],
    activeLink: null,
  };

  // scroll scope's container
  private scrollContainer: HTMLElement | Window;

  private scrollEvent: any;

  private animating: boolean;

  componentDidMount() {
    this.scrollContainer = this.getContainer();
    this.scrollEvent = addEventListener(
      this.scrollContainer,
      "scroll",
      this.handleScroll,
    );
    this.handleScroll();
  }

  componentDidUpdate() {
    if (this.scrollEvent) {
      const currentContainer = this.getContainer();
      if (this.scrollContainer !== currentContainer) {
        this.scrollContainer = currentContainer;
        this.scrollEvent.remove();
        this.scrollEvent = addEventListener(
          this.scrollContainer,
          "scroll",
          this.handleScroll,
        );
        this.handleScroll();
      }
    }
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }

  handleScroll = () => {
    if (this.animating) {
      return;
    }
    const { offsetTop, bounds } = this.props;
    const currentActiveLink = this.getCurrentAnchor(offsetTop || 0, bounds);
    this.setCurrentActiveLink(currentActiveLink);
  };

  getCurrentAnchor(offsetTop = 0, bounds = 0): string {
    const { getCurrentAnchor, list } = this.props;

    if (typeof getCurrentAnchor === "function") {
      return getCurrentAnchor();
    }

    const linkSections: Array<Section> = [];
    const container = this.getContainer();
    list.forEach(({ id }) => {
      const target = document.getElementById(id);
      if (target) {
        const top = getOffsetTop(target, container);
        if (top < offsetTop + bounds) {
          linkSections.push({
            link: id,
            top,
          });
        }
      }
    });

    if (linkSections.length) {
      const maxSection = linkSections.reduce((prev, curr) =>
        curr.top > prev.top ? curr : prev,
      );
      return maxSection.link;
    }
    return "";
  }

  getContainer() {
    const { getContainer } = this.props;

    const getFunc = getContainer || getDefaultContainer;

    return getFunc();
  }

  handleScrollTo = async (link: string) => {
    this.setCurrentActiveLink(link);
    const container = this.getContainer();
    const { offsetTop } = this.props;

    this.animating = true;
    await scrollTo(link, { container, offsetTop });

    // 最后一次滚动触发scroll事件存在一定的延时，稍微延迟一点再把标记位改为false
    setTimeout(() => {
      this.animating = false;
    }, 50);
  };

  setCurrentActiveLink = (link: string) => {
    const { activeLink } = this.state;
    const { onChange } = this.props;

    if (activeLink !== link) {
      this.setState({
        activeLink: link,
      });
      if (onChange) {
        onChange(link);
      }
    }
  };

  renderItem = (props: ItemRenderProps) => {
    const { renderItem = defaultRenderItem } = this.props;

    if (typeof renderItem === "function") {
      return renderItem(props);
    }

    return React.cloneElement(renderItem, props);
  };

  render() {
    const { activeLink } = this.state;
    const { style, list } = this.props;

    return (
      <Affix>
        <div className="anchor-container" style={style}>
          {list.map((config) => (
            <div
              key={config.id}
              className="anchor-item-wrapper"
              onClick={() => this.handleScrollTo(config.id)}
            >
              {this.renderItem({ ...config, active: activeLink === config.id })}
            </div>
          ))}
        </div>
      </Affix>
    );
  }
}

export default Anchor;
