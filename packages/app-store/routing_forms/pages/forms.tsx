import {
  TrashIcon,
  DotsHorizontalIcon,
  DuplicateIcon,
  PencilIcon,
  PlusIcon,
  CollectionIcon,
} from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

import { withQuery } from "@calcom/lib/QueryCell";
import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { Button, EmptyScreen } from "@calcom/ui";
import Dropdown, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@calcom/ui/Dropdown";
import { trpc } from "@calcom/web/lib/trpc";

import Shell from "@components/Shell";

export default function Forms() {
  const router = useRouter();
  const slug = router.query.slug;
  const page = router.query.page;
  const WithQuery = withQuery(["viewer.app_routing_forms.forms"]);

  const deleteMutation = trpc.useMutation("viewer.app_routing_forms.deleteForm", {
    onSettled: () => {
      utils.invalidateQueries(["viewer.app_routing_forms.forms"]);
    },
    onError: () => {
      showToast("Something went wrong", "error");
    },
  });
  const utils = trpc.useContext();

  const mutation = trpc.useMutation("viewer.app_routing_forms.form", {
    onSuccess: (data, variables) => {
      utils.invalidateQueries("viewer.app_routing_forms.forms");
      router.push(`/apps/routing_forms/form/${variables.id}`);
    },
    onError: (error) => {
      showToast(`Something went wrong`, "error");
    },
  });

  return (
    <Shell
      heading="Routing Forms"
      CTA={
        <Button
          onClick={() => {
            const form = {
              id: uuidv4(),
              name: "New Form",
            };
            mutation.mutate(form);
          }}
          data-testid="new-event-type"
          StartIcon={PlusIcon}>
          New Form
        </Button>
      }
      subtitle="You can see all routing forms and create one here.">
      <div className="-mx-4 md:-mx-8">
        <div className="mb-10 w-full bg-gray-50 px-4 pb-2 sm:px-6 md:px-8">
          <div>
            <WithQuery
              success={({ data: forms }) => {
                const { t } = useLocale();
                if (!forms.length) {
                  return (
                    <EmptyScreen
                      Icon={CollectionIcon}
                      headline="Create your first form"
                      description={
                        "Forms enable you to allow a booker to connect with the right person or choose the right event, faster. It would work by taking inputs from the booker and using that data to route to the correct booker/event as configured by Cal user"
                      }
                    />
                  );
                }
                return (
                  <div className="-mx-4 mb-16 overflow-hidden rounded-sm border border-gray-200 bg-white sm:mx-0">
                    <ul className="divide-y divide-neutral-200">
                      {forms.map((form, index) => {
                        form.routes = form.routes || [];
                        return (
                          <li key={index}>
                            <div className="flex items-center justify-between hover:bg-neutral-50 ">
                              <div className="group flex w-full items-center justify-between px-4 py-4 hover:bg-neutral-50 sm:px-6">
                                <Link href={"/apps/routing_forms/form/" + form.id}>
                                  <a
                                    className="flex-grow truncate text-sm "
                                    title="30min "
                                    href="/event-types/14">
                                    <div>{form.name}</div>
                                    <div className="mt-2 text-neutral-500 dark:text-white">
                                      {form.fields.length} attributes & {form.routes.length} routes
                                    </div>
                                  </a>
                                </Link>
                                <Dropdown>
                                  <DropdownMenuTrigger className="h-10 w-10 cursor-pointer rounded-sm border border-transparent text-neutral-500 hover:border-gray-300 hover:text-neutral-900 focus:border-gray-300">
                                    <DotsHorizontalIcon className="h-5 w-5 group-hover:text-gray-800" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Link href={"/apps/routing_forms/form/" + form.id} passHref={true}>
                                        <Button
                                          type="button"
                                          size="sm"
                                          color="minimal"
                                          className={classNames("w-full rounded-none")}
                                          StartIcon={PencilIcon}>
                                          {t("edit")}
                                        </Button>
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Button
                                        type="button"
                                        color="minimal"
                                        size="sm"
                                        className={classNames("hidden w-full rounded-none")}
                                        StartIcon={DuplicateIcon}>
                                        {t("duplicate")}
                                      </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="h-px bg-gray-200" />
                                    <DropdownMenuItem>
                                      <Button
                                        onClick={() => {
                                          deleteMutation.mutate({
                                            id: form.id,
                                          });
                                        }}
                                        color="warn"
                                        size="sm"
                                        StartIcon={TrashIcon}
                                        className="w-full rounded-none">
                                        {t("delete")}
                                      </Button>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </Dropdown>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }}></WithQuery>
          </div>
        </div>
      </div>
    </Shell>
  );
}