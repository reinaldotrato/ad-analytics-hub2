import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Channel = 'all' | 'google_ads' | 'meta_ads' | 'crm';

interface ChannelStatus {
  google_ads?: boolean;
  meta_ads?: boolean;
  crm?: boolean;
}

interface ChannelTabsProps {
  selectedChannel: Channel;
  onChannelChange: (channel: Channel) => void;
  channelStatus?: ChannelStatus;
}

const channelConfig = [
  { id: 'all' as Channel, label: 'Total' },
  { id: 'google_ads' as Channel, label: 'Google Ads' },
  { id: 'meta_ads' as Channel, label: 'Meta Ads' },
  { id: 'crm' as Channel, label: 'CRM' },
];

export function ChannelTabs({
  selectedChannel,
  onChannelChange,
  channelStatus = {},
}: ChannelTabsProps) {
  return (
    <Tabs value={selectedChannel} onValueChange={(v) => onChannelChange(v as Channel)}>
      <TabsList className="bg-muted/50">
        {channelConfig.map((channel) => {
          const isActive = channel.id !== 'all' && channelStatus[channel.id as keyof ChannelStatus];
          return (
            <TabsTrigger
              key={channel.id}
              value={channel.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {channel.label}
              {channel.id !== 'all' && isActive && (
                <Badge variant="secondary" className="ml-2 h-2 w-2 p-0 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
