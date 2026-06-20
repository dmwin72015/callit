import { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Application error:', error);
  }

  handleReload = () => {
    window.location.href = '/admin/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="应用异常"
          subTitle="抱歉，页面遇到了未知错误，请尝试刷新或返回首页"
          extra={<Button type="primary" onClick={this.handleReload}>返回首页</Button>}
        />
      );
    }
    return this.props.children;
  }
}
