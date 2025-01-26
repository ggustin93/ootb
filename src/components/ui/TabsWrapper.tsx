import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import type { Event } from '~/data/festival';

interface TabsWrapperProps {
  events: (Event & { id: string })[];
}

export default function TabsWrapper({ events }: TabsWrapperProps) {
  const uniqueTypes = React.useMemo(() => 
    [...new Set(events.map(event => event.type))],
    [events]
  );

  if (!uniqueTypes.length) return null;

  return (
    <Tabs defaultValue={uniqueTypes[0]} className="w-full">
      <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
        {uniqueTypes.map(type => (
          <TabsTrigger 
            key={type} 
            value={type}
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-300"
          >
            {type}
          </TabsTrigger>
        ))}
      </TabsList>
      {uniqueTypes.map(type => (
        <TabsContent key={type} value={type} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events
              .filter(event => event.type === type)
              .map(event => (
                <div 
                  key={event.id} 
                  data-event-type={event.type}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                  {event.speaker && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {event.speaker}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
} 