export interface WorkflowDecisionRequest {
  decision: 'APPROVE' | 'REJECT';
  note: string;
}
