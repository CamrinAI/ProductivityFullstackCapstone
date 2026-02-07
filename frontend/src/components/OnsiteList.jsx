import React from 'react';
import { Users, Wrench, Clock, MapPin } from 'lucide-react';

/**
 * OnsiteList - Display employees currently on site with checked out tools
 * Shows real-time status of who has what equipment
 */
export default function OnsiteList({ tools, users }) {
  // Filter tools that are checked out (not available)
  const checkedOutTools = tools.filter(tool => !tool.is_available);
  const unassignedTools = checkedOutTools.filter(tool => !tool.checked_out_by);

  const coworkerNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley',
    'Cameron', 'Avery', 'Jamie', 'Parker', 'Drew', 'Quinn'
  ];

  const coworkerMap = unassignedTools.reduce((acc, tool, idx) => {
    const name = coworkerNames[idx % coworkerNames.length];
    if (!acc[name]) acc[name] = [];
    acc[name].push(tool);
    return acc;
  }, {});

  const coworkerUsers = Object.entries(coworkerMap).map(([name, toolsList]) => ({
    id: `coworker-${name}`,
    username: name,
    role: 'coworker',
    tools: toolsList,
    toolCount: toolsList.length
  }));
  
  // Group tools by who has them checked out
  const employeesWithTools = users.map(user => {
    const userTools = checkedOutTools.filter(
      tool => tool.checked_out_by === user.id
    );
    return {
      ...user,
      tools: userTools,
      toolCount: userTools.length
    };
  }).filter(emp => emp.toolCount > 0); // Only show employees with tools

  const activeWithTools = [...employeesWithTools, ...coworkerUsers];

  // Employees without tools but active
  const availableEmployees = users.filter(user => 
    !employeesWithTools.find(emp => emp.id === user.id)
  );

  if (activeWithTools.length === 0 && checkedOutTools.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Tools Checked Out</h3>
        <p className="text-gray-400">All employees are available. No tools currently in use.</p>
      </div>
    );
  }
  
  // If tools are checked out but not assigned to users, show them in a generic list
  if (activeWithTools.length === 0 && checkedOutTools.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-400" />
          Checked Out Tools ({checkedOutTools.length})
        </h2>
        <div className="space-y-3">
          {checkedOutTools.map(tool => (
            <div key={tool.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tool.name}</p>
                  {tool.serial_number && (
                    <p className="text-sm text-gray-400">SN: {tool.serial_number}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-400">In Use</p>
                  {tool.checkout_date && (
                    <p className="text-xs text-gray-500">{new Date(tool.checkout_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employees with Checked Out Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Active On Site ({activeWithTools.length})
        </h2>
        
        <div className="space-y-4">
          {activeWithTools.map(employee => (
            <div
              key={employee.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/30 transition"
            >
              {/* Employee Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                      {employee.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{employee.username}</h3>
                      <p className="text-sm text-gray-400">{employee.role}</p>
                    </div>
                  </div>
                  {employee.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 ml-15">
                      <MapPin className="w-4 h-4" />
                      {employee.company}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{employee.toolCount}</div>
                  <p className="text-xs text-gray-400">Tool{employee.toolCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Tools List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Wrench className="w-4 h-4" />
                  <span className="font-semibold">Checked Out Tools:</span>
                </div>
                {employee.tools.map(tool => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between bg-gray-900/50 rounded px-4 py-3 border border-gray-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <p className="font-medium">
                        {employee.username} {tool.name} in use
                      </p>
                    </div>
                    {tool.checkout_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(tool.checkout_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Employees */}
      {availableEmployees.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Available ({availableEmployees.length})
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableEmployees.map(employee => (
              <div
                key={employee.id}
                className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold mx-auto mb-2">
                  {employee.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium truncate">{employee.username}</p>
                <p className="text-xs text-gray-500">{employee.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
