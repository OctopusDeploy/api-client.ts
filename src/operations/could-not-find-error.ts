export class CouldNotFindError extends Error {
  static createWhat(
    what: string,
    quotedName: string | null = null
  ): CouldNotFindError {
    const message = quotedName == null ? what : `${what} '${quotedName}'`;
    const e = new CouldNotFindError(
      `Could not find ${message}; either it does not exist or you lack permissions to view it.`
    );

    return e;
  }

  static createResource(
    resourceTypeDisplayName: string,
    nameOrId: string,
    enclosingContextDescription = ''
  ): CouldNotFindError {
    return CouldNotFindError.createWhat(
      `Cannot find the ${resourceTypeDisplayName} with name or id '${nameOrId}'${enclosingContextDescription}. Please check the spelling and that you have permissions to view it. Please use Configuration > Test Permissions to confirm.`
    );
  }

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CouldNotFindError.prototype);
  }
}
