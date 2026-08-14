import { Topbar } from '@/app/layout/Topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QueryState } from '@/components/organisms/QueryState';
import { Skeleton } from '@/components/ui/skeleton';
import { SendPaymentForm } from '@/features/send-payment/components/SendPaymentForm';
import { PaymentLifecycle } from '@/features/send-payment/components/PaymentLifecycle';
import { MeshActionsPanel } from '@/features/send-payment/components/MeshActionsPanel';
import { useSendPaymentFlow } from '@/features/send-payment/hooks/useSendPaymentFlow';
import { Send, Waypoints, AlertTriangle } from 'lucide-react';

export function SendPaymentPage() {
  const {
    form,
    errors,
    setField,
    submit,
    isSubmitting,
    stage,
    errorMessage,
    accountsQuery,
    devicesHoldingPackets,
    gossip,
    isGossiping,
    flush,
    isFlushing,
    reset,
    isResetting,
  } = useSendPaymentFlow();

  return (
    <div>
      <Topbar title="Send Payment" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-5">
          <CardHeader>
            <CardTitle>
              <Send className="h-4 w-4 text-mesh-blue" aria-hidden="true" />
              Compose Payment
            </CardTitle>
            <CardDescription>/api/demo/send</CardDescription>
          </CardHeader>

          <QueryState
            isLoading={accountsQuery.isLoading}
            isError={accountsQuery.isError}
            data={accountsQuery.data}
            loadingFallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            }
            errorDescription="Couldn't load accounts from the backend. Confirm the server is running on :8080."
            onRetry={() => accountsQuery.refetch()}
          >
            {(accounts) => (
              <SendPaymentForm
                accounts={accounts}
                form={form}
                errors={errors}
                setField={setField}
                onSubmit={submit}
                isSubmitting={isSubmitting}
                disabled={stage !== 'idle' && stage !== 'error'}
              />
            )}
          </QueryState>

          {errorMessage ? (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-mesh-red/25 bg-mesh-red/8 p-3 text-xs text-mesh-red">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          ) : null}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <CardHeader>
              <CardTitle>
                <Waypoints className="h-4 w-4 text-mesh-cyan" aria-hidden="true" />
                Payment Lifecycle
              </CardTitle>
            </CardHeader>
            <PaymentLifecycle stage={stage} isSubmitting={isSubmitting} isGossiping={isGossiping} isFlushing={isFlushing} />
            {stage === 'bridged' ? (
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Uploaded to the backend. Check <span className="text-foreground">Transactions</span> for the settlement outcome.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <CardHeader>
              <CardTitle>Mesh Progression</CardTitle>
              <CardDescription>/api/mesh/*</CardDescription>
            </CardHeader>
            <MeshActionsPanel
              devicesHoldingPackets={devicesHoldingPackets}
              onGossip={gossip}
              isGossiping={isGossiping}
              onFlush={flush}
              isFlushing={isFlushing}
              onReset={reset}
              isResetting={isResetting}
              disabled={stage === 'idle'}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
