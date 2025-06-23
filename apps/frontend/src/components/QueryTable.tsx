import React, { useState, useEffect } from 'react';
import { Play, Trophy, Clock, AlertCircle } from 'lucide-react';
import { QueryDefinition, QueryStatus } from '../types';

interface QueryTableProps {
  queries: QueryDefinition[];
  queryStatuses: Record<string, QueryStatus>;
  onRunQuery: (queryId: string) => void;
  fastestQueryId?: string;
}

const QueryTable: React.FC<QueryTableProps> = ({
  queries,
  queryStatuses,
  onRunQuery,
  fastestQueryId,
}) => {
  const getStatusColor = (status: QueryStatus['status']) => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'completed':
        return 'status-completed';
      case 'error':
        return 'status-error';
      default:
        return 'status-idle';
    }
  };

  const getStatusIcon = (status: QueryStatus['status']) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'completed':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (durationMs === undefined || durationMs === -1) return '-';
    return `${durationMs}ms`;
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'neo4j' 
      ? 'source-neo4j' 
      : 'source-elasticsearch';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Query Performance Benchmark</h2>
        <p className="text-sm text-gray-600 mt-1">
          Click the play button to execute queries and compare performance
        </p>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Query</th>
              <th>Source</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => {
              const status = queryStatuses[query.id] || { status: 'idle' };
              const isFastest = fastestQueryId === query.id;
              
                              return (
                <tr key={query.id}>
                  <td>
                    <div className="flex items-center">
                      {isFastest && (
                        <Trophy className="icon text-yellow-600" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {query.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {query.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`status-badge ${getSourceBadgeColor(query.database)}`}>
                      {query.database.toUpperCase()}
                    </span>
                  </td>
                  
                  <td>
                    <div className={`status-badge ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)}
                      <span className="ml-1 capitalize">{status.status}</span>
                    </div>
                  </td>
                  
                  <td>
                    <div className="text-sm text-gray-900">
                      {formatDuration(status.durationMs)}
                    </div>
                    {status.error && (
                      <div className="text-xs text-red-600" title={status.error}>
                        Error occurred
                      </div>
                    )}
                  </td>
                  
                  <td>
                    <button
                      onClick={() => onRunQuery(query.id)}
                      disabled={status.status === 'running'}
                      className={`btn ${status.status === 'running' ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      <Play className="icon-sm" />
                      {status.status === 'running' ? 'Running...' : 'Run'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryTable; 