import { IIdName } from '@octopusdeploy/message-contracts/dist/resource';
import { CouldNotFindError } from './could-not-find-error';

export async function throwIfUndefined<T extends IIdName>(
  // eslint-disable-next-line no-shadow
  findPromise: (nameOrId: string) => Promise<T | undefined>,
  getPromise: (id: string) => Promise<T>,
  resourceTypeIdPrefix: string,
  resourceTypeDisplayName: string,
  nameOrId: string,
  enclosingContextDescription = '',
  skipLog = false
): Promise<T> {
  const escapeRegExp = (text: string) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  let resourceById: T | undefined;
  if (
    !new RegExp(`^${escapeRegExp(resourceTypeIdPrefix)}-/d+$`).test(nameOrId)
  ) {
    resourceById = undefined;
  } else {
    try {
      resourceById = await getPromise(nameOrId);
    } catch {
      resourceById = undefined;
    }
  }

  let resourceByName: T | undefined;
  try {
    resourceByName = await findPromise(nameOrId);
  } catch {
    resourceByName = undefined;
  }

  if (resourceById === undefined && resourceByName === undefined)
    throw CouldNotFindError.createResource(
      resourceTypeDisplayName,
      nameOrId,
      enclosingContextDescription
    );

  if (
    resourceById !== undefined &&
    resourceByName !== undefined &&
    resourceById.Id !== resourceByName.Id
  )
    throw new Error(
      `Ambiguous ${resourceTypeDisplayName} reference '${nameOrId}' matches both '${resourceById.Name}' (${resourceById.Id}) and '${resourceByName.Name}' (${resourceByName.Id}).`
    );

  const found = resourceById ?? resourceByName;
  if (found === undefined) {
    throw CouldNotFindError.createResource(
      resourceTypeDisplayName,
      nameOrId,
      enclosingContextDescription
    );
  }

  return found;
}
