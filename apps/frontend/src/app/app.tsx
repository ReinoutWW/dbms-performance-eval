// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import React from 'react';
import { PlayCircle, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import QueryTable from '../components/QueryTable';
import useQueryBenchmark from '../hooks/useQueryBenchmark';

// Router imports removed - not needed for this single page app

const App: React.FC = () => {
  const {
    queries,
    queryStatuses,
    fastestQueryId,
    isConnected,
    error,
    runQuery,
    runAllQueries,
    resetResults,
  } = useQueryBenchmark();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Query Performance Benchmark
              </h1>
              <div className="ml-4 flex items-center">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="icon" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="icon" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetResults}
                className="btn btn-secondary"
              >
                <RotateCcw className="icon" />
                Reset
              </button>
              
              <button
                onClick={runAllQueries}
                disabled={!isConnected}
                className={`btn ${isConnected ? 'btn-primary' : 'btn-secondary'}`}
              >
                <PlayCircle className="icon" />
                Run All
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 card" style={{backgroundColor: '#fee2e2', borderColor: '#fecaca'}}>
            <div className="flex" style={{padding: '1rem'}}>
              <div>
                <WifiOff className="icon text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <div className="text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {queries.length > 0 ? (
          <QueryTable
            queries={queries}
            queryStatuses={queryStatuses}
            onRunQuery={runQuery}
            fastestQueryId={fastestQueryId}
          />
        ) : (
          <div className="card text-center" style={{padding: '2rem'}}>
            <div className="flex justify-center items-center mb-4">
              {isConnected ? (
                <div className="animate-spin" style={{width: '2rem', height: '2rem', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%'}}></div>
              ) : (
                <WifiOff style={{width: '2rem', height: '2rem', color: '#9ca3af'}} />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isConnected ? 'Loading queries...' : 'No connection to server'}
            </h3>
            <p className="text-gray-600">
              {isConnected 
                ? 'Please wait while we fetch the available queries.'
                : 'Please check your connection and try again.'
              }
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12" style={{borderTop: '1px solid #e5e7eb'}}>
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              Query Performance Benchmark Tool - Compare Neo4j and Elasticsearch query performance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
