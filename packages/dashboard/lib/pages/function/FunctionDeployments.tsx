import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getCurrentDomain, getFullCurrentDomain, getFullDomain } from 'lib/utils';
import { Button, Card, EmptyState, Link, Text, Dialog } from '@lagon/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { trpc } from 'lib/trpc';
import useFunction from 'lib/hooks/useFunction';
import { QueryObserverBaseResult } from '@tanstack/react-query';
import { useI18n } from 'locales';

type FunctionDeploymentsProps = {
  func: ReturnType<typeof useFunction>['data'];
  refetch: QueryObserverBaseResult['refetch'];
};

const FunctionDeployments = ({ func, refetch }: FunctionDeploymentsProps) => {
  const { scopedT } = useI18n();
  const t = scopedT('functions.deployments');
  const undeployDeployment = trpc.deploymentUndeploy.useMutation();
  const promoteDeployment = trpc.deploymentPromote.useMutation();

  const removeDeplomyent = useCallback(
    async (deployment: { id: string }) => {
      await undeployDeployment.mutateAsync({
        functionId: func?.id || '',
        deploymentId: deployment.id,
      });

      await refetch();
      toast.success(t('delete.success'));
    },
    [func?.id, undeployDeployment, refetch, t],
  );

  const promoteDeploymentHandler = useCallback(
    async (deployment: { id: string }) => {
      await promoteDeployment.mutateAsync({
        functionId: func?.id || '',
        deploymentId: deployment.id,
      });

      await refetch();
      toast.success(t('promote.success'));
    },
    [func?.id, promoteDeployment, refetch, t],
  );

  return (
    <div className="flex flex-col gap-4">
      {!func || func.deployments.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
          action={
            <Button href="https://docs.lagon.app/cloud/deployments" target="_blank">
              {t('empty.action')}
            </Button>
          }
        />
      ) : null}
      {func?.deployments.map(deployment => {
        const date = new Date(deployment.createdAt);
        date.setHours(date.getHours() - date.getTimezoneOffset() / 60);

        return (
          <Card key={deployment.id}>
            <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
              {deployment.isProduction ? (
                <span className="absolute -top-5 -left-5 rounded bg-blue-500 px-1 text-xs text-white">
                  {t('list.production')}
                </span>
              ) : null}
              <div className="md:w-1/3">
                {func.cron === null ? (
                  <>
                    <Link href={getFullCurrentDomain({ name: deployment.id })} target="_blank">
                      {getCurrentDomain({ name: deployment.id })}
                    </Link>
                    {deployment.isProduction ? (
                      <>
                        {func.domains.map(domain => (
                          <Link key={domain} href={getFullDomain(domain)} target="_blank">
                            {domain}
                          </Link>
                        ))}
                      </>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-blue-500">{t('cron')}</p>
                )}
                <Text size="sm">
                  {date.toLocaleString('en-US', {
                    minute: 'numeric',
                    hour: 'numeric',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </div>
              <div>
                <Text>{deployment.commit || t('list.noCommit')}</Text>
                <Text>
                  {t('list.by')}&nbsp;{deployment.triggerer}
                </Text>
              </div>
              <div className="flex gap-2 md:w-1/3 md:justify-end">
                {!deployment.isProduction ? (
                  <>
                    <Dialog
                      title={t('promote.modal.title')}
                      description={t('promote.modal.description')}
                      disclosure={
                        <Button
                          leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                          disabled={undeployDeployment.isLoading}
                        >
                          {t('promote')}
                        </Button>
                      }
                    >
                      <Dialog.Buttons>
                        <Dialog.Cancel />
                        <Dialog.Action onClick={() => promoteDeploymentHandler(deployment)}>
                          {t('promote.modal.submit')}
                        </Dialog.Action>
                      </Dialog.Buttons>
                    </Dialog>
                    <Dialog
                      title={t('delete.modal.title')}
                      description={t('delete.modal.description')}
                      disclosure={
                        <Button variant="danger" disabled={undeployDeployment.isLoading}>
                          {t('delete')}
                        </Button>
                      }
                    >
                      <Dialog.Buttons>
                        <Dialog.Cancel disabled={undeployDeployment.isLoading} />
                        <Dialog.Action
                          variant="danger"
                          onClick={() => removeDeplomyent(deployment)}
                          disabled={undeployDeployment.isLoading}
                        >
                          {t('delete.modal.submit')}
                        </Dialog.Action>
                      </Dialog.Buttons>
                    </Dialog>
                  </>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FunctionDeployments;
