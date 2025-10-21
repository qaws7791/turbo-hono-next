"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";
import { tv } from "tailwind-variants";

import { Button } from "./button";

import type { VariantProps } from "tailwind-variants";

const treeViewStyles = tv({
  slots: {
    root: "select-none",
    node: "relative",
    nodeContent: [
      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
      /* Hover */
      "hover:bg-accent/50",
      /* Selected */
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
    ],
    nodeToggle: [
      "flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground transition-colors",
      "data-[expanded=true]:text-foreground",
    ],
    nodeIcon: "flex items-center justify-center w-4 h-4 text-muted-foreground",
    nodeLabel: "flex-1 min-w-0 text-sm text-foreground",
    nodeActions:
      "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
    children: [
      "ml-5 border-l border-border/50 pl-3 space-y-1",
      /* Animation */
      "data-[expanded=false]:hidden data-[expanded=true]:block",
    ],
    connectingLine: "absolute left-2 top-8 bottom-0 w-px bg-border/50",
    leafConnector: "absolute left-2 top-4 w-3 h-px bg-border/50",
  },
  variants: {
    size: {
      sm: {
        nodeContent: "p-1.5 text-xs",
        nodeLabel: "text-xs",
        children: "ml-4 pl-2",
      },
      md: {
        nodeContent: "p-2 text-sm",
        nodeLabel: "text-sm",
        children: "ml-5 pl-3",
      },
      lg: {
        nodeContent: "p-3 text-base",
        nodeLabel: "text-base",
        children: "ml-6 pl-4",
      },
    },
    variant: {
      default: {},
      bordered: {
        nodeContent: "border border-border",
        children: "border-l-2",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

type TreeViewStylesProps = VariantProps<typeof treeViewStyles>;

export interface TreeNode {
  id: string;
  label: string;
  children?: Array<TreeNode>;
  icon?: React.ReactNode;
  data?: Record<string, unknown>;
}

interface TreeNodeProps extends TreeViewStylesProps {
  node: TreeNode;
  level?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  onToggle?: (nodeId: string) => void;
  onSelect?: (nodeId: string, data?: Record<string, unknown>) => void;
  onAction?: (
    action: string,
    nodeId: string,
    data?: Record<string, unknown>,
  ) => void;
  renderActions?: (node: TreeNode) => React.ReactNode;
}

interface TreeViewProps extends TreeViewStylesProps {
  nodes: Array<TreeNode>;
  expandedNodes?: Set<string>;
  selectedNode?: string;
  onToggle?: (nodeId: string) => void;
  onSelect?: (nodeId: string, data?: Record<string, unknown>) => void;
  onAction?: (
    action: string,
    nodeId: string,
    data?: Record<string, unknown>,
  ) => void;
  renderActions?: (node: TreeNode) => React.ReactNode;
  className?: string;
}

const TreeNodeComponent = React.memo<TreeNodeProps>(
  ({
    node,
    level = 0,
    isExpanded = false,
    isSelected = false,
    onToggle,
    onSelect,
    onAction,
    renderActions,
    size = "md",
    variant = "default",
  }) => {
    const slots = treeViewStyles({ size, variant });
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = () => {
      if (hasChildren) {
        onToggle?.(node.id);
      }
    };

    const handleSelect = () => {
      onSelect?.(node.id, node.data);
    };

    return (
      <div className={slots.node()}>
        <div
          className={`group ${slots.nodeContent()}`}
          data-selected={isSelected}
          onClick={handleSelect}
        >
          {/* Toggle button for expandable nodes */}
          {hasChildren ? (
            <Button
              onPress={handleToggle}
              className={slots.nodeToggle()}
              data-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className={slots.nodeToggle()} />
          )}

          {/* Node icon */}
          {node.icon && <div className={slots.nodeIcon()}>{node.icon}</div>}

          {/* Node label */}
          <div className={slots.nodeLabel()}>{node.label}</div>

          {/* Node actions */}
          {renderActions && (
            <div className={slots.nodeActions()}>{renderActions(node)}</div>
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className={slots.children()}
            data-expanded={isExpanded}
          >
            {isExpanded &&
              node.children!.map((childNode) => (
                <TreeNodeComponent
                  key={childNode.id}
                  node={childNode}
                  level={level + 1}
                  isExpanded={false} // Children expansion state should be managed by parent
                  isSelected={false} // Selection state should be managed by parent
                  onToggle={onToggle}
                  onSelect={onSelect}
                  onAction={onAction}
                  renderActions={renderActions}
                  size={size}
                  variant={variant}
                />
              ))}
          </div>
        )}
      </div>
    );
  },
);

TreeNodeComponent.displayName = "TreeNodeComponent";

const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(
  (
    {
      nodes,
      expandedNodes = new Set(),
      selectedNode,
      onToggle,
      onSelect,
      onAction,
      renderActions,
      size = "md",
      variant = "default",
      className,
      ...props
    },
    ref,
  ) => {
    const slots = treeViewStyles({ size, variant });

    return (
      <div
        ref={ref}
        className={slots.root({ className })}
        {...props}
      >
        {nodes.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            isExpanded={expandedNodes.has(node.id)}
            isSelected={selectedNode === node.id}
            onToggle={onToggle}
            onSelect={onSelect}
            onAction={onAction}
            renderActions={renderActions}
            size={size}
            variant={variant}
          />
        ))}
      </div>
    );
  },
);

TreeView.displayName = "TreeView";

export { TreeNodeComponent, TreeView, treeViewStyles };
export type { TreeNodeProps, TreeViewProps, TreeViewStylesProps };
