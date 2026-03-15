"use client";

import {
  useGeneratorStore,
  getGeneratorConfig,
  getDependencies,
  getFolderTree,
  getCliCommand,
} from "@/store/generatorStore";
import type { FolderNode } from "@/store/generatorStore";
import { useResolvedVersions } from "@/hooks/useResolvedVersions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getTemplateById } from "@/lib/templates";

function FolderTreeNode({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const isDir = !!node.children;
  const indent = depth * 12;

  return (
    <div>
      <div
        className="hover:bg-muted flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors"
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        <span className="font-mono text-xs opacity-50">
          {depth > 0 ? (isDir ? "📁" : "📄") : "📦"}
        </span>
        <span className={cn("font-mono text-xs", isDir ? "text-primary" : "text-muted-foreground")}>
          {node.name}
        </span>
      </div>
      {node.children?.map((child) => (
        <FolderTreeNode key={child.name + depth} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function PreviewPanel() {
  const store = useGeneratorStore();
  const [copied, setCopied] = useState(false);
  const config = getGeneratorConfig(store);
  const { versions } = useResolvedVersions(config);
  const selectedTemplate = getTemplateById(store.templateId);

  const depGroups = getDependencies(config, versions);
  const tree = getFolderTree(config);
  const cli = getCliCommand(config);

  function handleCopy() {
    navigator.clipboard.writeText(cli);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalDeps = depGroups.reduce((a, g) => a + g.deps.length, 0);

  return (
    <div className="border-border bg-card sticky top-6 flex h-[calc(100vh-7rem)] flex-col rounded-2xl border shadow-sm">
      <div className="border-border border-b px-4 py-3">
        <h2 className="text-foreground text-sm font-semibold">Live Preview</h2>
        <p className="text-muted-foreground text-xs">Updates as you configure</p>
      </div>

      <Tabs defaultValue="structure" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="bg-muted text-muted-foreground mx-4 mt-3 mb-2 grid h-8 grid-cols-3 rounded-lg">
          <TabsTrigger
            value="structure"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md text-xs data-[state=active]:shadow-sm"
          >
            Structure
          </TabsTrigger>
          <TabsTrigger
            value="deps"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md text-xs data-[state=active]:shadow-sm"
          >
            Deps ({totalDeps})
          </TabsTrigger>
          <TabsTrigger
            value="cli"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md text-xs data-[state=active]:shadow-sm"
          >
            CLI
          </TabsTrigger>
        </TabsList>

        {/* Folder structure */}
        <TabsContent value="structure" className="m-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full px-3 pb-4">
            <div className="py-2">
              <FolderTreeNode node={tree} />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Dependencies */}
        <TabsContent value="deps" className="m-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full px-3 pb-4">
            <div className="space-y-4 py-2">
              {depGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wider uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.deps.map((dep) => (
                      <Badge
                        key={dep}
                        variant="secondary"
                        className="bg-muted text-foreground font-mono text-[10px] font-normal"
                      >
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* CLI */}
        <TabsContent value="cli" className="m-0 flex-1 overflow-hidden">
          <div className="px-3 pt-2 pb-4">
            <div className="border-border bg-muted/50 flex items-start gap-2 rounded-xl border p-3">
              <code className="text-primary flex-1 font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap select-all">
                {cli}
              </code>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:bg-muted-foreground hover:text-foreground shrink-0 rounded-lg p-1.5 transition-all"
              >
                {copied ? (
                  <CheckIcon className="text-primary h-3.5 w-3.5" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Project Info
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="text-foreground font-mono">{selectedTemplate.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-mono">{store.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next.js</span>
                  <span className="text-foreground font-mono">
                    {versions?.next ? `${store.nextVersion} (${versions.next})` : store.nextVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="text-foreground font-mono">{store.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Router</span>
                  <span className="text-foreground font-mono">{store.router} router</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package Manager</span>
                  <span className="text-foreground font-mono">{store.packageManager}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
