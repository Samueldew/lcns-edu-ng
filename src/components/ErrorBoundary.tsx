import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('LCNS Crash:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:20, background:'#0a2d1f', color:'white', minHeight:'100vh'}}>
          <h2 style={{fontWeight:'900'}}>⚠️ LCNS App Error - No Blank Again</h2>
          <p style={{fontSize:12, marginTop:10, color:'#fbbf24'}}>Chief, copy this error send me:</p>
          <pre style={{background:'#042114', padding:12, borderRadius:12, fontSize:11, marginTop:10, overflow:'auto', color:'#86efac'}}>
            {String(this.state.error?.message || this.state.error)}
            {'\n'}{this.state.error?.stack?.slice(0, 1000)}
          </pre>
          <button onClick={()=>{localStorage.removeItem('lcns_erp_current_user'); localStorage.removeItem('lcns-current-user'); location.reload();}} style={{marginTop:12, background:'#facc15', color:'#042114', padding:'10px 20px', borderRadius:999, fontWeight:'900'}}>Clear Login & Reload</button>
          <p style={{marginTop:12, fontSize:11}}>For help: lcnsgboko@gmail.com | @ICT 08126799565</p>
        </div>
      );
    }
    return this.props.children;
  }
}
