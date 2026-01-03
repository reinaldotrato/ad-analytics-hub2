import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface ChannelTabsProps {
  children?: ReactNode;
  activeChannel?: string;
  onChannelChange?: (channel: string) => void;
  channels?: Array<{ id: string; label: string }>;
}

const defaultChannels = [
  { id: "all", label: "Todos" },
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "tiktok", label: "TikTok Ads" },
];

export function ChannelTabs({
  children,
  activeChannel = "all",
  onChannelChange,
  channels = defaultChannels,
}: ChannelTabsProps) {
  return (
    <Tabs value={activeChannel} onValueChange={onChannelChange}>
      <TabsList>
        {channels.map((channel) => (
          <TabsTrigger key={channel.id} value={channel.id}>
            {channel.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function ChannelTabContent({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return <TabsContent value={value}>{children}</TabsContent>;
}
