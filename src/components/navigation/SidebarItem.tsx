import { Badge, Space, Typography } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import type { ReactNode } from "react";

export interface SidebarNode {
  id: string;
  icon?: ReactNode;
  label: string;
  description?: string;
  path?: string;
  badgeText?: string;
  activeRoutePatterns?: string[];
  children?: SidebarNode[];
}

interface SidebarActiveState {
  selectedKeys: string[];
  openKeys: string[];
  activeNode?: SidebarNode;
}

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

const nodeKey = (node: SidebarNode) => node.path ?? node.id;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const routeTemplateToRegex = (template: string): RegExp => {
  const normalizedTemplate = normalizePath(template);
  if (normalizedTemplate === "/") {
    return /^\/$/;
  }

  const escaped = normalizedTemplate
    .split("/")
    .map((segment) => {
      if (!segment) {
        return "";
      }

      if (segment.startsWith(":")) {
        return "[^/]+";
      }

      return escapeRegex(segment);
    })
    .join("/");

  return new RegExp(`^${escaped}(?:/.*)?$`);
};

const isPathActive = (currentPath: string, routeTemplate: string) =>
  routeTemplateToRegex(routeTemplate).test(normalizePath(currentPath));

const getNodeActivePatterns = (node: SidebarNode): string[] =>
  [node.path, ...(node.activeRoutePatterns ?? [])].filter((pattern): pattern is string => Boolean(pattern));

const renderNodeLabel = (node: SidebarNode, collapsed: boolean) => {
  if (collapsed) {
    return node.label;
  }

  return (
    <Space orientation="vertical" size={1} style={{ width: "100%", lineHeight: 1.2 }}>
      <Space size={6} align="center" wrap>
        <Typography.Text className="app-sidebar__item-label">{node.label}</Typography.Text>
        {node.badgeText ? (
          <Badge
            count={node.badgeText}
            color="#1677ff"
            style={{ boxShadow: "none", fontWeight: 600 }}
          />
        ) : null}
      </Space>
      {node.description ? (
        <Typography.Text className="app-sidebar__item-description">
          {node.description}
        </Typography.Text>
      ) : null}
    </Space>
  );
};

export const buildSidebarMenuItems = (nodes: SidebarNode[], collapsed: boolean): ItemType[] =>
  nodes.map((node) => {
    const children = node.children?.length ? buildSidebarMenuItems(node.children, collapsed) : undefined;

    return {
      key: nodeKey(node),
      icon: node.icon,
      label: renderNodeLabel(node, collapsed),
      children,
      title: node.label,
    };
  });

export const resolveSidebarActiveState = (nodes: SidebarNode[], currentPath?: string): SidebarActiveState => {
  if (!currentPath) {
    return { selectedKeys: [], openKeys: [] };
  }

  const matches: Array<{
    score: number;
    node: SidebarNode;
    parentKeys: string[];
  }> = [];

  const visit = (node: SidebarNode, parentKeys: string[]) => {
    getNodeActivePatterns(node).forEach((pattern) => {
      if (!isPathActive(currentPath, pattern)) {
        return;
      }

      const score = normalizePath(pattern).length;
      matches.push({ score, node, parentKeys });
    });

    if (node.children?.length) {
      const nextParentKeys = [...parentKeys, nodeKey(node)];
      node.children.forEach((child) => visit(child, nextParentKeys));
    }
  };

  nodes.forEach((node) => visit(node, []));

  const matchedNode = matches.sort((left, right) => right.score - left.score)[0];

  if (!matchedNode) {
    return { selectedKeys: [], openKeys: [] };
  }

  return {
    selectedKeys: [nodeKey(matchedNode.node)],
    openKeys: matchedNode.parentKeys,
    activeNode: matchedNode.node,
  };
};
