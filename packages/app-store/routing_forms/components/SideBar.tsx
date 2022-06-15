import {
  ExternalLinkIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/solid";
import { useRouter } from "next/router";

import { CAL_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { Switch } from "@calcom/ui";
import { DialogTrigger, Dialog } from "@calcom/ui/Dialog";
import { trpc } from "@calcom/web/lib/trpc";

import ConfirmationDialogContent from "@components/dialog/ConfirmationDialogContent";

export default function SideBar({ form }) {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const router = useRouter();
  const mutation = trpc.useMutation("viewer.app_routing_forms.form", {
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSettled() {
      utils.invalidateQueries(["viewer.app_routing_forms.form"]);
    },
  });

  const deleteMutation = trpc.useMutation("viewer.app_routing_forms.deleteForm", {
    onError() {
      showToast(`Something went wrong`, "error");
    },
    onSuccess() {
      // TODO: App URL should be read and only relative URL should be hardcoded here.
      router.push("/apps/routing_forms/forms");
    },
  });

  const formLink = `${CAL_URL}/apps/routing_forms/routingLink/${form.id}`;

  return (
    <div className="m-0 mt-1 mb-4 w-full lg:w-3/12 lg:px-2 lg:ltr:ml-2 lg:rtl:mr-2">
      <div className="px-2">
        <Switch
          checked={!form.disabled}
          onCheckedChange={(isChecked) => {
            mutation.mutate({ ...form, disabled: !isChecked });
          }}
          label={!form.disabled ? t("Disable Form") : t("Enable Form")}
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <a
          href={formLink}
          target="_blank"
          rel="noreferrer"
          className="text-md inline-flex items-center rounded-sm px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-gray-200 hover:text-gray-900">
          <ExternalLinkIcon className="h-4 w-4 text-neutral-500 ltr:mr-2 rtl:ml-2" aria-hidden="true" />
          {t("preview")}
        </a>
        <button
          onClick={() => {
            navigator.clipboard.writeText(formLink);
            showToast("Link copied!", "success");
          }}
          type="button"
          className="text-md flex items-center rounded-sm px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
          <LinkIcon className="h-4 w-4 text-neutral-500 ltr:mr-2 rtl:ml-2" />
          {t("Copy link to form")}
        </button>
        <Dialog>
          <DialogTrigger className="text-md flex items-center rounded-sm px-2 py-1 text-sm font-medium text-red-500 hover:bg-gray-200">
            <TrashIcon className="h-4 w-4 text-red-500 ltr:mr-2 rtl:ml-2" />
            {t("delete")}
          </DialogTrigger>
          <ConfirmationDialogContent
            isLoading={deleteMutation.isLoading}
            variety="danger"
            title="Delete Form"
            confirmBtnText="Yes, delete form"
            onConfirm={() => {
              deleteMutation.mutate({ id: form.id });
            }}>
            Are you sure you want to delete this form? Anyone who you've shared the link with will no longer
            be able to book using it.
          </ConfirmationDialogContent>
        </Dialog>
      </div>
    </div>
  );
}