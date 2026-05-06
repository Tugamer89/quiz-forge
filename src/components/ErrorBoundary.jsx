import { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import * as Sentry from '@sentry/react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown Rendering Error:', error, errorInfo);

    const eventId = Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });

    this.setState({ eventId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between text-red-600 dark:text-red-400 text-sm gap-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
            <span>Rendering error. Check your syntax.</span>
          </div>

          {this.state.eventId && (
            <button
              onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}
              className="flex items-center justify-center px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-800/50 dark:hover:bg-red-700/50 rounded-md transition-colors text-xs font-semibold"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Report Issue
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
